export type VehicleStatus = "ligado" | "desligado" | "erro";

export type SyncStatus = "sincronizado" | "pendente" | "offline";

export type VehicleInfo = {
  id: string;
  label: string;
  plate: string;
  brand: string;
  model: string;
};

export type TelemetryData = {
  speed: number;
  rpm: number;
  engineTemperature: number;
  vehicleStatus: VehicleStatus;
  storedRecords: number;
  syncStatus: SyncStatus;
  timestamp: string;
};

export type EventConfig = {
  limiteVelocidade: number;
  tempoParadaLongaMinutos: number;
  limiteFrenagemBrusca: number;
  limiteAceleracaoBrusca: number;
};

export type DeviceStatus = {
  connected: boolean;
  deviceName: string;
  firmwareVersion: string;
  lastSyncAt: string | null;
};

export type DashboardData = {
  vehicle: VehicleInfo | null;
  status: DeviceStatus;
  telemetry: TelemetryData | null;
  logs: LogEntry[];
  config: EventConfig | null;
};

export type LogEntry = {
  level: "info" | "warning" | "error";
  message: string;
  timestamp: string;
};

export type DeviceCommand = "sync";
