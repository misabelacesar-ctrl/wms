import { useState } from 'react';
import { Lock, Package, RotateCcw } from 'lucide-react';
import { WAREHOUSE_CONFIG } from '../domain/warehouseConfig';
import { PositionStatus, WarehousePosition } from '../types/wms';

type StatusFilter = 'ALL' | PositionStatus;

interface WarehouseMapProps {
  positions: WarehousePosition[];
  selectedPositionId: string | null;
  onSelectPosition: (position: WarehousePosition) => void;
  onResetWarehouse: () => void;
}

export function WarehouseMap({
  positions,
  selectedPositionId,
  onSelectPosition,
  onResetWarehouse,
}: WarehouseMapProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [aisleFilter, setAisleFilter] = useState<string>('ALL');
  const [confirmingReset, setConfirmingReset] = useState(false);

  const visibleAisles =
    aisleFilter === 'ALL'
      ? WAREHOUSE_CONFIG.aisles
      : WAREHOUSE_CONFIG.aisles.filter((a) => `RUA-${a}` === aisleFilter);

  // Nível 5 no topo e Nível 1 no piso para representar fielmente o porta-paletes
  const levelsTopDown = Array.from(
    { length: WAREHOUSE_CONFIG.levelsPerModule },
    (_, i) => WAREHOUSE_CONFIG.levelsPerModule - i
  );
  const modulesOrder = Array.from(
    { length: WAREHOUSE_CONFIG.modulesPerAisle },
    (_, i) => i + 1
  );

  const positionByCoord = new Map<string, WarehousePosition>();
  for (const pos of positions) {
    positionByCoord.set(`${pos.aisleCode}-${pos.moduleNumber}-${pos.levelNumber}`, pos);
  }

  return (
    <section
      id="mapa-armazem"
      aria-label="Mapa visual do armazém"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">
            Mapa Visual do Armazém
          </h2>
          <p className="text-xs text-slate-600 font-mono tabular-nums">
            6 ruas (A–F) · 30 módulos (MOD-01 a MOD-05) · 5 níveis · 150 posições
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded border border-emerald-400 bg-emerald-50 inline-flex items-center justify-center text-[10px] font-mono font-semibold text-emerald-800"
              aria-hidden="true"
            >
              L
            </span>
            <span>Livre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded border border-blue-800 bg-blue-700 inline-flex items-center justify-center text-white"
              aria-hidden="true"
            >
              <Package className="w-2.5 h-2.5" />
            </span>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded border border-amber-400 wms-slot-unavailable inline-flex items-center justify-center text-amber-950"
              aria-hidden="true"
            >
              <Lock className="w-2.5 h-2.5" />
            </span>
            <span>Indisponível</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start overflow-x-auto max-w-full"
          role="group"
          aria-label="Filtrar posições por status"
        >
          {(
            [
              { value: 'ALL', label: 'Todas' },
              { value: PositionStatus.LIVRE, label: 'Livres' },
              { value: PositionStatus.OCUPADO, label: 'Ocupadas' },
              { value: PositionStatus.INDISPONIVEL, label: 'Indisponíveis' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === option.value
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="aisle-filter" className="sr-only">
            Filtrar por rua
          </label>
          <select
            id="aisle-filter"
            value={aisleFilter}
            onChange={(e) => setAisleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Todas as ruas (A–F)</option>
            {WAREHOUSE_CONFIG.aisles.map((aisle) => (
              <option key={aisle} value={`RUA-${aisle}`}>
                Rua {aisle} (RUA-{aisle})
              </option>
            ))}
          </select>

          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Zerar Armazém
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onResetWarehouse();
                  setConfirmingReset(false);
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Confirmar Limpeza
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid gap-5 ${
          visibleAisles.length === 1
            ? 'grid-cols-1 max-w-xl'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}
      >
        {visibleAisles.map((aisleLetter) => {
          const aisleCode = `RUA-${aisleLetter}`;
          const aislePositions = positions.filter((p) => p.aisleCode === aisleCode);
          const freeCount = aislePositions.filter(
            (p) => p.status === PositionStatus.LIVRE
          ).length;
          const occupiedCount = aislePositions.filter(
            (p) => p.status === PositionStatus.OCUPADO
          ).length;
          const unavailableCount = aislePositions.filter(
            (p) => p.status === PositionStatus.INDISPONIVEL
          ).length;

          return (
            <div
              key={aisleCode}
              className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/60"
            >
              <div className="flex items-baseline justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Rua {aisleLetter}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">{aisleCode}</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-600">
                  {freeCount}L · {occupiedCount}O
                  {unavailableCount > 0 ? ` · ${unavailableCount}I` : ''}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-[28px_repeat(5,minmax(0,1fr))] gap-1.5 items-center">
                  <span className="text-[10px] font-mono text-slate-400 text-center">
                    Nív.
                  </span>
                  {modulesOrder.map((modNum) => (
                    <div
                      key={modNum}
                      className="text-[10px] font-mono font-medium text-slate-500 text-center"
                      title={`Módulo ${String(modNum).padStart(2, '0')}`}
                    >
                      M{String(modNum).padStart(2, '0')}
                    </div>
                  ))}
                </div>

                {levelsTopDown.map((levelNum) => (
                  <div
                    key={levelNum}
                    className="grid grid-cols-[28px_repeat(5,minmax(0,1fr))] gap-1.5 items-center"
                  >
                    <span
                      className="text-[10px] font-mono font-medium text-slate-500 text-center"
                      title={
                        levelNum === 1
                          ? 'NIVEL-1 (Piso)'
                          : levelNum === 5
                            ? 'NIVEL-5 (Topo)'
                            : `NIVEL-${levelNum}`
                      }
                    >
                      N{levelNum}
                    </span>

                    {modulesOrder.map((modNum) => {
                      const pos = positionByCoord.get(
                        `${aisleCode}-${modNum}-${levelNum}`
                      );
                      if (!pos) return null;

                      const isSelected = pos.id === selectedPositionId;
                      const matchesFilter =
                        statusFilter === 'ALL' || pos.status === statusFilter;

                      let slotStyle =
                        'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                      let statusText = 'Livre';

                      if (pos.status === PositionStatus.OCUPADO) {
                        slotStyle =
                          'bg-blue-700 border-blue-800 text-white hover:bg-blue-800';
                        statusText = `Ocupado: ${pos.item?.sku ?? ''} (${pos.item?.productName ?? ''})`;
                      } else if (pos.status === PositionStatus.INDISPONIVEL) {
                        slotStyle =
                          'wms-slot-unavailable border-amber-400 text-amber-950 hover:brightness-95';
                        statusText = 'Indisponível';
                      }

                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => onSelectPosition(pos)}
                          aria-label={`${pos.fullAddress} — ${statusText}`}
                          title={`${pos.fullAddress} (${statusText})`}
                          className={`h-10 rounded border text-[10px] font-mono font-medium transition-all flex items-center justify-center px-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${slotStyle} ${
                            isSelected ? 'ring-2 ring-slate-900 ring-offset-1' : ''
                          } ${!matchesFilter ? 'opacity-25' : ''}`}
                        >
                          {pos.status === PositionStatus.LIVRE && (
                            <span className="text-emerald-800">L</span>
                          )}
                          {pos.status === PositionStatus.OCUPADO && (
                            <span className="truncate max-w-full">
                              {pos.item?.sku.slice(0, 6)}
                            </span>
                          )}
                          {pos.status === PositionStatus.INDISPONIVEL && (
                            <Lock className="w-3 h-3 text-amber-900" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
