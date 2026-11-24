import { useEffect } from 'react';
import { WarehousePosition } from '../types/wms';

interface PickingConfirmModalProps {
  position: WarehousePosition | null;
  onCancel: () => void;
  onConfirm: (addressId: string) => void;
}

export function PickingConfirmModal({
  position,
  onCancel,
  onConfirm,
}: PickingConfirmModalProps) {
  useEffect(() => {
    if (!position) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onCancel]);

  if (!position || !position.item) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="picking-modal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h2
            id="picking-modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            Confirmar Saída (Picking)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Confira os dados da mercadoria antes de registrar a baixa e liberar a
            posição no mapa do armazém.
          </p>
        </div>

        <dl className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-sm">
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <dt className="text-slate-500">Endereço</dt>
            <dd className="font-mono font-semibold text-slate-900">
              {position.fullAddress}
            </dd>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <dt className="text-slate-500">Localização</dt>
            <dd className="text-slate-700 text-right">
              {position.aisleLabel} · {position.moduleCode} · {position.levelCode}
            </dd>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <dt className="text-slate-500">Código / SKU</dt>
            <dd className="font-mono font-semibold text-blue-700">
              {position.item.sku}
            </dd>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <dt className="text-slate-500">Produto</dt>
            <dd className="font-medium text-slate-900 text-right">
              {position.item.productName}
            </dd>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <dt className="text-slate-500">Quantidade</dt>
            <dd className="font-mono tabular-nums font-semibold text-slate-900">
              {position.item.quantity.toLocaleString('pt-BR')} un.
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(position.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors cursor-pointer"
          >
            Confirmar Baixa
          </button>
        </div>
      </div>
    </div>
  );
}
