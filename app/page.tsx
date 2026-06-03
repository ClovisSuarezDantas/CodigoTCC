"use client";

import { CommandPanel } from "@/src/components/CommandPanel";
import { ConfigPanel } from "@/src/components/ConfigPanel";
import { EventConfigPanel } from "@/src/components/EventConfigPanel";
import { LogsPanel } from "@/src/components/LogsPanel";
import { StatusBar } from "@/src/components/StatusBar";
import { TelemetryPanel } from "@/src/components/TelemetryPanel";
import { useTelemetry } from "@/src/hooks/useTelemetry";

export default function Home() {
  const {
    baseUrl,
    updateBaseUrl,
    dashboard,
    error,
    lastUpdated,
    isLoading,
    isCommandRunning,
    isSavingConfig,
    refresh,
    testConnection,
    runCommand,
    saveConfig
  } = useTelemetry();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-slate-300 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              Caixa preta veicular
            </h1>
            <p className="mt-1 text-base text-slate-600">
              Monitoramento real com backend NestJS, PostgreSQL, RabbitMQ, ESP32 e OBD-II/CAN.
            </p>
          </div>
          <div className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Dados reais da API
          </div>
        </header>

        <ConfigPanel
          baseUrl={baseUrl}
          isLoading={isLoading}
          onBaseUrlChange={updateBaseUrl}
          onTestConnection={testConnection}
        />

        <StatusBar
          status={dashboard.status}
          vehicle={dashboard.vehicle}
          error={error}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />

        <TelemetryPanel telemetry={dashboard.telemetry} />

        <EventConfigPanel
          vehicle={dashboard.vehicle}
          config={dashboard.config}
          isSaving={isSavingConfig}
          onSave={saveConfig}
        />

        <CommandPanel
          isBusy={isCommandRunning}
          isLoading={isLoading}
          onCommand={runCommand}
          onRefresh={refresh}
        />

        <LogsPanel logs={dashboard.logs} />
      </div>
    </main>
  );
}
