import type { DeviceStatus, VehicleInfo } from "@/src/types/telemetry";

type StatusBarProps = {
  status: DeviceStatus;
  vehicle: VehicleInfo | null;
  error: string | null;
  lastUpdated: string | null;
  isLoading: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

export function StatusBar({
  status,
  vehicle,
  error,
  lastUpdated,
  isLoading
}: StatusBarProps) {
  const connectedClasses = status.connected
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${connectedClasses}`}>
              {status.connected ? "Conectado" : "Desconectado"}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
              Backend real
            </span>
            {isLoading ? (
              <span className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                Atualizando
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{status.deviceName}</h2>
          <p className="text-sm text-slate-600">
            {vehicle ? `${vehicle.label} | Placa ${vehicle.plate}` : "Nenhum veiculo carregado"} | {status.firmwareVersion}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:text-right">
          <div>
            <div>Ultima leitura da tela</div>
            <div className="font-semibold text-slate-900">{formatDateTime(lastUpdated)}</div>
          </div>
          <div>
            <div>Ultima sincronizacao</div>
            <div className="font-semibold text-slate-900">{formatDateTime(status.lastSyncAt)}</div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
    </section>
  );
}
