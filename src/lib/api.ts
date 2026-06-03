import type {
  DashboardData,
  DeviceStatus,
  EventConfig,
  LogEntry,
  SyncStatus,
  TelemetryData,
  VehicleInfo
} from "@/src/types/telemetry";

export const DEFAULT_BASE_URL = "http://localhost:3000";

const BASE_URL_STORAGE_KEY = "telemetria_backend_base_url";
const TOKEN_STORAGE_KEY = "telemetria_backend_token";
const REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_TCC_EMAIL ?? "aluno@tcc.com";
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_TCC_PASSWORD ?? "123456";

type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  ok: false;
  message: string;
};

type LoginResponse = {
  accessToken: string;
};

type DispositivoApi = {
  id: string;
  veiculoId: string;
  codigoDispositivo: string;
  statusSincronizacao: "SINCRONIZADO" | "NAO_SINCRONIZADO";
  ultimaSincronizacao: string | null;
};

type VeiculoApi = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  dispositivo?: DispositivoApi | null;
};

type RegistroTelemetriaApi = {
  id: string;
  timestamp: string;
  velocidadeObd: number | null;
  rpm: number | null;
  temperaturaMotor: number | null;
};

type EventoApi = {
  tipo: string;
  descricao: string;
  severidade: "BAIXA" | "MEDIA" | "ALTA";
  timestamp: string;
};

type ConfiguracaoApi = EventConfig & {
  id: string;
  veiculoId: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export function getStoredBaseUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_BASE_URL;
  }

  return localStorage.getItem(BASE_URL_STORAGE_KEY) || DEFAULT_BASE_URL;
}

export function saveBaseUrl(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(BASE_URL_STORAGE_KEY, normalizeBaseUrl(url));
}

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function saveToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

async function requestJson<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    return {
      ok: false,
      message: "Informe a URL base do backend antes de conectar."
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `O backend respondeu com erro HTTP ${response.status}.`
      };
    }

    if (response.status === 204) {
      return { ok: true, data: undefined as T };
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : (undefined as T);

    return { ok: true, data };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        message: "Tempo limite ao conectar com o backend. Verifique se a API NestJS esta rodando."
      };
    }

    if (error instanceof SyntaxError) {
      return {
        ok: false,
        message: "O backend respondeu, mas o JSON retornado nao pode ser lido."
      };
    }

    return {
      ok: false,
      message: "Nao foi possivel conectar ao backend. Confira a URL e o CORS da API."
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function authenticatedRequest<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
) {
  const tokenResult = await getBackendToken(baseUrl);

  if (!tokenResult.ok) {
    return tokenResult;
  }

  return requestJson<T>(baseUrl, path, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokenResult.data}`,
      ...(options?.headers ?? {})
    }
  });
}

async function getBackendToken(baseUrl: string): Promise<ApiResult<string>> {
  const storedToken = getStoredToken();

  if (storedToken) {
    return { ok: true, data: storedToken };
  }

  const loginResult = await requestJson<LoginResponse>(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: DEFAULT_EMAIL,
      senha: DEFAULT_PASSWORD
    })
  });

  if (!loginResult.ok) {
    return {
      ok: false,
      message: `${loginResult.message} Execute o seed ou informe credenciais validas em NEXT_PUBLIC_TCC_EMAIL/NEXT_PUBLIC_TCC_PASSWORD.`
    };
  }

  saveToken(loginResult.data.accessToken);
  return { ok: true, data: loginResult.data.accessToken };
}

function syncStatusFromApi(status?: DispositivoApi["statusSincronizacao"]): SyncStatus {
  if (status === "SINCRONIZADO") {
    return "sincronizado";
  }

  if (status === "NAO_SINCRONIZADO") {
    return "offline";
  }

  return "pendente";
}

function mapVehicle(veiculo: VeiculoApi): VehicleInfo {
  return {
    id: veiculo.id,
    label: `${veiculo.marca} ${veiculo.modelo}`,
    plate: veiculo.placa,
    brand: veiculo.marca,
    model: veiculo.modelo
  };
}

function mapTelemetry(
  registro: RegistroTelemetriaApi | undefined,
  totalRegistros: number,
  syncStatus: SyncStatus
): TelemetryData | null {
  if (!registro) {
    return null;
  }

  const speed = registro.velocidadeObd ?? 0;
  const rpm = registro.rpm ?? 0;

  return {
    speed,
    rpm,
    engineTemperature: registro.temperaturaMotor ?? 0,
    vehicleStatus: speed > 0 || rpm > 0 ? "ligado" : "desligado",
    storedRecords: totalRegistros,
    syncStatus,
    timestamp: registro.timestamp
  };
}

function mapLogs(eventos: EventoApi[]): LogEntry[] {
  return eventos.map((evento) => ({
    level: evento.severidade === "ALTA" ? "error" : evento.severidade === "MEDIA" ? "warning" : "info",
    message: `${evento.tipo}: ${evento.descricao}`,
    timestamp: evento.timestamp
  }));
}

function mapStatus(dispositivo?: DispositivoApi | null): DeviceStatus {
  return {
    connected: dispositivo?.statusSincronizacao === "SINCRONIZADO",
    deviceName: dispositivo?.codigoDispositivo ?? "Nenhum dispositivo cadastrado",
    firmwareVersion: "ESP32 OBD-II",
    lastSyncAt: dispositivo?.ultimaSincronizacao ?? null
  };
}

export async function fetchDashboard(baseUrl: string): Promise<ApiResult<DashboardData>> {
  const veiculosResult = await authenticatedRequest<VeiculoApi[]>(baseUrl, "/veiculos");

  if (!veiculosResult.ok) {
    return veiculosResult;
  }

  const veiculo = veiculosResult.data[0];

  if (!veiculo) {
    return {
      ok: true,
      data: {
        vehicle: null,
        status: mapStatus(null),
        telemetry: null,
        logs: [],
        config: null
      }
    };
  }

  const syncStatus = syncStatusFromApi(veiculo.dispositivo?.statusSincronizacao);
  const [registrosResult, eventosResult, configResult] = await Promise.all([
    authenticatedRequest<RegistroTelemetriaApi[]>(baseUrl, `/telemetria/veiculo/${veiculo.id}`),
    authenticatedRequest<EventoApi[]>(baseUrl, `/eventos/veiculo/${veiculo.id}`),
    authenticatedRequest<ConfiguracaoApi>(baseUrl, `/configuracoes-veiculo/${veiculo.id}`)
  ]);

  if (!registrosResult.ok) {
    return { ok: false, message: registrosResult.message };
  }

  if (!eventosResult.ok) {
    return { ok: false, message: eventosResult.message };
  }

  if (!configResult.ok) {
    return { ok: false, message: configResult.message };
  }

  return {
    ok: true,
    data: {
      vehicle: mapVehicle(veiculo),
      status: mapStatus(veiculo.dispositivo),
      telemetry: mapTelemetry(registrosResult.data[0], registrosResult.data.length, syncStatus),
      logs: mapLogs(eventosResult.data),
      config: {
        limiteVelocidade: configResult.data.limiteVelocidade,
        tempoParadaLongaMinutos: configResult.data.tempoParadaLongaMinutos,
        limiteFrenagemBrusca: configResult.data.limiteFrenagemBrusca,
        limiteAceleracaoBrusca: configResult.data.limiteAceleracaoBrusca
      }
    }
  };
}

export async function verifySync(baseUrl: string) {
  return authenticatedRequest<{ atualizados?: number; limiteSemAtualizacaoMinutos?: number }>(
    baseUrl,
    "/dispositivos/verificar-sincronizacao",
    { method: "PATCH" }
  );
}

export async function updateVehicleConfig(
  baseUrl: string,
  vehicleId: string,
  config: EventConfig
) {
  return authenticatedRequest<ConfiguracaoApi>(
    baseUrl,
    `/configuracoes-veiculo/${vehicleId}`,
    {
      method: "PUT",
      body: JSON.stringify(config)
    }
  );
}
