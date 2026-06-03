type ConfigPanelProps = {
  baseUrl: string;
  isLoading: boolean;
  onBaseUrlChange: (value: string) => void;
  onTestConnection: () => void;
};

export function ConfigPanel({
  baseUrl,
  isLoading,
  onBaseUrlChange,
  onTestConnection
}: ConfigPanelProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,460px)] lg:items-end">
        <div>
          <div className="text-sm font-medium text-slate-700">Fonte de dados</div>
          <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            Backend real conectado por API REST
          </div>
        </div>

        <div>
          <label htmlFor="backend-url" className="mb-2 block text-sm font-medium text-slate-700">
            URL base da API
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="backend-url"
              type="url"
              value={baseUrl}
              onChange={(event) => onBaseUrlChange(event.target.value)}
              placeholder="http://localhost:3000"
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={onTestConnection}
              disabled={isLoading}
              className="min-h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Testar conexao
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
