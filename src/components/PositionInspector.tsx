import { ArrowDownToLine, ArrowUpFromLine, Lock, LockOpen, MapPin } from 'lucide-react';
import { PositionStatus, WarehousePosition } from '../types/wms';

interface PositionInspectorProps {
  position: WarehousePosition | null;
  onStartPutawayAtAddress: (addressId: string) => void;
  onRequestPicking: (position: WarehousePosition) => void;
  onToggleAvailability: (addressId: string) => void;
}

export function PositionInspector({
  position,
  onStartPutawayAtAddress,
  onRequestPicking,
  onToggleAvailability,
}: PositionInspectorProps) {
  if (!position) {
    return (
      <div className="py-10 px-4 text-center space-y-2">
        <MapPin className="w-7 h-7 text-slate-400 mx-auto" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-800">
          Nenhuma posição selecionada
        </p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Clique em qualquer célula do mapa do armazém para visualizar detalhes,
          registrar entrada, bloquear posição ou executar picking.
        </p>
      </div>
    );
  }

  const levelDescription =
    position.levelNumber === 1
      ? 'NIVEL-1 (Piso)'
      : position.levelNumber === 5
        ? 'NIVEL-5 (Topo)'
        : position.levelCode;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5 pb-4 border-b border-slate-200">
        <p className="text-xs font-medium text-slate-500">Endereço selecionado</p>
        <p className="text-base font-semibold font-mono text-slate-900">
          {position.fullAddress}
        </p>
        <p className="text-xs text-slate-600">
          {position.aisleLabel} · {position.moduleCode} · {levelDescription}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Status atual</span>
        {position.status === PositionStatus.LIVRE && (
          <span className="font-medium text-emerald-700">Livre para alocação</span>
        )}
        {position.status === PositionStatus.OCUPADO && (
          <span className="font-medium text-blue-700">Ocupado</span>
        )}
        {position.status === PositionStatus.INDISPONIVEL && (
          <span className="font-medium text-amber-800">Indisponível (bloqueado)</span>
        )}
      </div>

      {position.status === PositionStatus.LIVRE && (
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => onStartPutawayAtAddress(position.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" aria-hidden="true" />
            Registrar Entrada Nesta Posição
          </button>

          <button
            type="button"
            onClick={() => onToggleAvailability(position.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            Marcar como Indisponível
          </button>
        </div>
      )}

      {position.status === PositionStatus.INDISPONIVEL && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            Esta posição está bloqueada para manutenção ou restrição física e não
            entra no cálculo de capacidade utilizável.
          </p>

          <button
            type="button"
            onClick={() => onToggleAvailability(position.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <LockOpen className="w-4 h-4" aria-hidden="true" />
            Desfazer Indisponibilidade (Tornar Livre)
          </button>
        </div>
      )}

      {position.status === PositionStatus.OCUPADO && position.item && (
        <div className="space-y-4 pt-1">
          <dl className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-sm">
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
              <dt className="text-slate-500">Código / SKU</dt>
              <dd className="font-mono font-semibold text-slate-900">
                {position.item.sku}
              </dd>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
              <dt className="text-slate-500">Produto</dt>
              <dd className="font-medium text-slate-900 text-right">
                {position.item.productName}
              </dd>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
              <dt className="text-slate-500">Quantidade</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-900">
                {position.item.quantity.toLocaleString('pt-BR')} un.
              </dd>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
              <dt className="text-slate-500">Alocado em</dt>
              <dd className="font-mono text-xs tabular-nums text-slate-600">
                {new Date(position.item.storedAt).toLocaleString('pt-BR')}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => onRequestPicking(position)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <ArrowUpFromLine className="w-4 h-4" aria-hidden="true" />
            Dar Baixa / Saída (Picking)
          </button>
        </div>
      )}
    </div>
  );
}
