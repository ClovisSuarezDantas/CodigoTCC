import type {
  DashboardData,
  DeviceRecord,
  DeviceStatus,
  EventConfig,
  EventRecord,
  LogEntry,
  SyncStatus,
  TelemetryData,
  TelemetryRecord,
  VehicleInfo,
  VehicleRecord
} from "@/src/types/telemetry";

export const DEFAULT_BASE_URL = "http://localhost:8080";

const BASE_URL_STORAGE_KEY = "telemetria_backend_base_url";
const AUTH_STORAGE_KEY = "telemetria_backend_auth";
const REQUEST_TIMEOUT_MS = 5000;

type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  ok: false;
  message: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type BackendUser = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  usuario: BackendUser;
  accessToken: string;
};

type AuthResponse = AuthSession;

type DispositivoApi = DeviceRecord;

type VeiculoApi = VehicleRecord & {
  dispositivo?: DispositivoApi | null;
};

type RegistroTelemetriaApi = TelemetryRecord;

type EventoApi = EventRecord;

type ConfiguracaoApi = EventConfig & {
  id: string;
  veiculoId: string;
};

const DEMO_TOKEN = "demo-local-token";

const demoConfig: ConfiguracaoApi = {
  id: "config-demo-1",
  veiculoId: "veiculo-demo-1",
  limiteVelocidade: 80,
  tempoParadaLongaMinutos: 10,
  limiteFrenagemBrusca: 20,
  limiteAceleracaoBrusca: 25
};

const demoVehicles: VehicleRecord[] = [
  {
    id: "veiculo-demo-1",
    placa: "ABC1D23",
    chassi: "9BWZZZ377VT004251",
    marca: "Volkswagen",
    modelo: "Gol",
    ano: 2018,
    configuracao: demoConfig,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-12T14:30:00.000Z"
  },
  {
    id: "veiculo-demo-2",
    placa: "TCC2A26",
    chassi: "9BGKS48B0FG123456",
    marca: "Chevrolet",
    modelo: "Onix",
    ano: 2021,
    createdAt: "2026-06-02T11:00:00.000Z",
    updatedAt: "2026-06-12T14:30:00.000Z"
  }
];

const demoDevices: DeviceRecord[] = [
  {
    id: "dispositivo-demo-1",
    veiculoId: "veiculo-demo-1",
    codigoDispositivo: "ESP32-TCC-001",
    statusSincronizacao: "SINCRONIZADO",
    ultimaSincronizacao: "2026-06-13T22:48:23.000Z",
    veiculo: demoVehicles[0],
    createdAt: "2026-06-01T10:05:00.000Z",
    updatedAt: "2026-06-13T22:48:23.000Z"
  },
  {
    id: "dispositivo-demo-2",
    veiculoId: "veiculo-demo-2",
    codigoDispositivo: "ESP32-TCC-002",
    statusSincronizacao: "NAO_SINCRONIZADO",
    ultimaSincronizacao: "2026-06-13T18:10:00.000Z",
    veiculo: demoVehicles[1],
    createdAt: "2026-06-02T11:05:00.000Z",
    updatedAt: "2026-06-13T18:10:00.000Z"
  }
];

const demoTelemetry: TelemetryRecord[] = [
  {
    id: "telemetria-demo-1",
    pacoteId: "PKT-0004",
    dispositivoId: "dispositivo-demo-1",
    veiculoId: "veiculo-demo-1",
    timestamp: "2026-06-13T22:48:23.000Z",
    velocidadeObd: 86,
    rpm: 3100,
    temperaturaMotor: 92,
    createdAt: "2026-06-13T22:48:24.000Z"
  },
  {
    id: "telemetria-demo-2",
    pacoteId: "PKT-0003",
    dispositivoId: "dispositivo-demo-1",
    veiculoId: "veiculo-demo-1",
    timestamp: "2026-06-13T22:47:23.000Z",
    velocidadeObd: 72,
    rpm: 2600,
    temperaturaMotor: 89,
    createdAt: "2026-06-13T22:47:24.000Z"
  },
  {
    id: "telemetria-demo-3",
    pacoteId: "PKT-0002",
    dispositivoId: "dispositivo-demo-1",
    veiculoId: "veiculo-demo-1",
    timestamp: "2026-06-13T22:46:23.000Z",
    velocidadeObd: 0,
    rpm: 780,
    temperaturaMotor: 86,
    createdAt: "2026-06-13T22:46:24.000Z"
  }
];

const demoEvents: EventRecord[] = [
  {
    id: "evento-demo-1",
    veiculoId: "veiculo-demo-1",
    dispositivoId: "dispositivo-demo-1",
    registroTelemetriaId: "telemetria-demo-1",
    tipo: "EXCESSO_VELOCIDADE",
    descricao: "Velocidade registrada de 86 km/h acima do limite configurado de 80 km/h.",
    severidade: "MEDIA",
    timestamp: "2026-06-13T22:48:23.000Z",
    veiculo: demoVehicles[0],
    dispositivo: demoDevices[0],
    registroTelemetria: demoTelemetry[0],
    createdAt: "2026-06-13T22:48:24.000Z"
  },
  {
    id: "evento-demo-2",
    veiculoId: "veiculo-demo-1",
    dispositivoId: "dispositivo-demo-1",
    registroTelemetriaId: "telemetria-demo-2",
    tipo: "ACELERACAO_BRUSCA",
    descricao: "Aumento de velocidade acima do limite configurado em curto intervalo.",
    severidade: "ALTA",
    timestamp: "2026-06-13T22:47:23.000Z",
    veiculo: demoVehicles[0],
    dispositivo: demoDevices[0],
    registroTelemetria: demoTelemetry[1],
    createdAt: "2026-06-13T22:47:24.000Z"
  },
  {
    id: "evento-demo-3",
    veiculoId: "veiculo-demo-1",
    dispositivoId: "dispositivo-demo-1",
    registroTelemetriaId: "telemetria-demo-3",
    tipo: "PARADA_PROLONGADA",
    descricao: "Veiculo permaneceu parado acima do tempo configurado.",
    severidade: "BAIXA",
    timestamp: "2026-06-13T22:46:23.000Z",
    veiculo: demoVehicles[0],
    dispositivo: demoDevices[0],
    registroTelemetria: demoTelemetry[2],
    createdAt: "2026-06-13T22:46:24.000Z"
  }
];

demoVehicles[0] = {
  ...demoVehicles[0],
  dispositivo: demoDevices[0],
  configuracao: demoConfig
};

demoVehicles[1] = {
  ...demoVehicles[1],
  dispositivo: demoDevices[1]
};

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

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isDemoSession() {
  return getAuthSession()?.accessToken === DEMO_TOKEN;
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

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : `O backend respondeu com erro HTTP ${response.status}.`;

      if (response.status === 401) {
        clearAuthSession();
      }

      return {
        ok: false,
        message
      };
    }

    return { ok: true, data: data as T };
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
      message: "Nao foi possivel conectar ao backend. Confira a URL, a porta e o CORS da API."
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
  const session = getAuthSession();

  if (!session?.accessToken) {
    return {
      ok: false,
      message: "Sessao expirada. Faca login novamente."
    } satisfies ApiFailure;
  }

  return requestJson<T>(baseUrl, path, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(options?.headers ?? {})
    }
  });
}

export async function login(baseUrl: string, email: string, senha: string) {
  const result = await requestJson<AuthResponse>(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha })
  });

  if (result.ok) {
    saveBaseUrl(baseUrl);
    saveAuthSession(result.data);
  }

  return result;
}

export async function register(
  baseUrl: string,
  payload: { nome: string; email: string; senha: string }
) {
  const result = await requestJson<AuthResponse>(baseUrl, "/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (result.ok) {
    saveBaseUrl(baseUrl);
    saveAuthSession(result.data);
  }

  return result;
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
  if (isDemoSession()) {
    const veiculo = demoVehicles[0];

    return {
      ok: true,
      data: {
        vehicle: mapVehicle(veiculo),
        status: mapStatus(demoDevices[0]),
        telemetry: mapTelemetry(demoTelemetry[0], demoTelemetry.length, "sincronizado"),
        logs: mapLogs(demoEvents),
        config: {
          limiteVelocidade: demoConfig.limiteVelocidade,
          tempoParadaLongaMinutos: demoConfig.tempoParadaLongaMinutos,
          limiteFrenagemBrusca: demoConfig.limiteFrenagemBrusca,
          limiteAceleracaoBrusca: demoConfig.limiteAceleracaoBrusca
        }
      }
    };
  }

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
  if (isDemoSession()) {
    return {
      ok: true,
      data: {
        dispositivosMarcadosComoNaoSincronizados: 1,
        limiteSemAtualizacaoMinutos: 5
      }
    } satisfies ApiResult<{
      dispositivosMarcadosComoNaoSincronizados?: number;
      atualizados?: number;
      limiteSemAtualizacaoMinutos?: number;
    }>;
  }

  return authenticatedRequest<{
    dispositivosMarcadosComoNaoSincronizados?: number;
    atualizados?: number;
    limiteSemAtualizacaoMinutos?: number;
  }>(baseUrl, "/dispositivos/verificar-sincronizacao", { method: "PATCH" });
}

export async function updateVehicleConfig(
  baseUrl: string,
  vehicleId: string,
  config: EventConfig
) {
  if (isDemoSession()) {
    return {
      ok: true,
      data: {
        id: demoConfig.id,
        veiculoId: vehicleId,
        ...config
      }
    } satisfies ApiResult<ConfiguracaoApi>;
  }

  return authenticatedRequest<ConfiguracaoApi>(
    baseUrl,
    `/configuracoes-veiculo/${vehicleId}`,
    {
      method: "PUT",
      body: JSON.stringify(config)
    }
  );
}

export function fetchVehicles(baseUrl: string) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: demoVehicles
    } satisfies ApiResult<VehicleRecord[]>);
  }

  return authenticatedRequest<VehicleRecord[]>(baseUrl, "/veiculos");
}

export function createVehicle(
  baseUrl: string,
  payload: { placa: string; chassi?: string; marca: string; modelo: string; ano: number }
) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: {
        id: `veiculo-demo-${Date.now()}`,
        chassi: payload.chassi ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload
      }
    } satisfies ApiResult<VehicleRecord>);
  }

  return authenticatedRequest<VehicleRecord>(baseUrl, "/veiculos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateVehicle(
  baseUrl: string,
  id: string,
  payload: Partial<{ placa: string; chassi: string; marca: string; modelo: string; ano: number }>
) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: {
        ...demoVehicles[0],
        ...payload,
        id,
        chassi: payload.chassi ?? demoVehicles[0].chassi
      }
    } satisfies ApiResult<VehicleRecord>);
  }

  return authenticatedRequest<VehicleRecord>(baseUrl, `/veiculos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteVehicle(baseUrl: string, id: string) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: { message: "Veiculo removido com sucesso no modo demo." }
    } satisfies ApiResult<{ message: string }>);
  }

  return authenticatedRequest<{ message: string }>(baseUrl, `/veiculos/${id}`, {
    method: "DELETE"
  });
}

export function fetchDevices(baseUrl: string) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: demoDevices
    } satisfies ApiResult<DeviceRecord[]>);
  }

  return authenticatedRequest<DeviceRecord[]>(baseUrl, "/dispositivos");
}

export function createDevice(
  baseUrl: string,
  payload: { veiculoId: string; codigoDispositivo: string }
) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: {
        id: `dispositivo-demo-${Date.now()}`,
        statusSincronizacao: "SINCRONIZADO",
        ultimaSincronizacao: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload
      }
    } satisfies ApiResult<DeviceRecord>);
  }

  return authenticatedRequest<DeviceRecord>(baseUrl, "/dispositivos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateDevice(
  baseUrl: string,
  id: string,
  payload: Partial<{ codigoDispositivo: string; statusSincronizacao: DeviceRecord["statusSincronizacao"] }>
) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: {
        ...demoDevices[0],
        ...payload,
        id
      }
    } satisfies ApiResult<DeviceRecord>);
  }

  return authenticatedRequest<DeviceRecord>(baseUrl, `/dispositivos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteDevice(baseUrl: string, id: string) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: { message: "Dispositivo removido com sucesso no modo demo." }
    } satisfies ApiResult<{ message: string }>);
  }

  return authenticatedRequest<{ message: string }>(baseUrl, `/dispositivos/${id}`, {
    method: "DELETE"
  });
}

export function fetchEvents(baseUrl: string) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: demoEvents
    } satisfies ApiResult<EventRecord[]>);
  }

  return authenticatedRequest<EventRecord[]>(baseUrl, "/eventos");
}

export function fetchVehicleTelemetry(baseUrl: string, veiculoId: string) {
  if (isDemoSession()) {
    return Promise.resolve({
      ok: true,
      data: demoTelemetry.filter((record) => record.veiculoId === veiculoId)
    } satisfies ApiResult<TelemetryRecord[]>);
  }

  return authenticatedRequest<TelemetryRecord[]>(
    baseUrl,
    `/telemetria/veiculo/${veiculoId}`
  );
}
