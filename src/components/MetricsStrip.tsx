import { WarehouseMetrics } from '../types/wms';

interface MetricsStripProps {
  metrics: WarehouseMetrics;
}

export function MetricsStrip({ metrics }: MetricsStripProps) {
  const formattedRate = metrics.occupancyRate.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section id="indicadores" aria-label="Painel de indicadores do armazém">
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">Taxa de ocupação</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formattedRate}%
            </span>
          </div>
          <div className="space-y-1.5">
            <div
              className="w-full h-1.5 bg-slate-100 rounded-sm overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(metrics.occupancyRate)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Percentual de ocupação do armazém"
            >
              <div
                className="h-full bg-blue-700 transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, metrics.occupancyRate))}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              {metrics.occupiedPositions} ocupadas / {metrics.usablePositions} utilizáveis
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">Posições livres</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {metrics.freePositions}
          </span>
          <p className="text-xs text-slate-500">Disponíveis para recebimento</p>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">Posições ocupadas</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            {metrics.occupiedPositions}
          </span>
          <p className="text-xs text-slate-500">Com mercadoria alocada</p>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">Posições indisponíveis</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {metrics.unavailablePositions}
          </span>
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            Capacidade total: {metrics.totalPositions} posições
          </p>
        </div>
      </div>
    </section>
  );
}
