import { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { WAREHOUSE_CONFIG } from '../domain/warehouseConfig';
import { PositionStatus, PutawayInput, WarehousePosition } from '../types/wms';

interface PutawayFormProps {
  positions: WarehousePosition[];
  preselectedAddressId: string | null;
  blockedSelectionNotice: string | null;
  onSubmitPutaway: (input: PutawayInput) => { ok: boolean; error?: string };
}

export function PutawayForm({
  positions,
  preselectedAddressId,
  blockedSelectionNotice,
  onSubmitPutaway,
}: PutawayFormProps) {
  const [sku, setSku] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [addressId, setAddressId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedAddressId) {
      setAddressId(preselectedAddressId);
      setErrorMessage(null);
    }
  }, [preselectedAddressId]);

  const freePositionsCount = positions.filter(
    (p) => p.status === PositionStatus.LIVRE
  ).length;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedQuantity = Number(quantity);
    if (!sku.trim()) {
      setErrorMessage('Informe o Código/SKU do produto.');
      return;
    }
    if (!productName.trim()) {
      setErrorMessage('Informe o Nome do produto.');
      return;
    }
    if (!quantity.trim() || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setErrorMessage('Informe uma quantidade positiva maior que zero.');
      return;
    }
    if (!addressId) {
      setErrorMessage('Selecione um endereço de destino livre.');
      return;
    }

    const result = onSubmitPutaway({
      sku,
      productName,
      quantity: parsedQuantity,
      addressId,
    });

    if (!result.ok) {
      setErrorMessage(result.error ?? 'Não foi possível concluir a entrada.');
      return;
    }

    setSuccessMessage(
      `Mercadoria ${sku.trim().toUpperCase()} alocada em ${addressId}.`
    );
    setSku('');
    setProductName('');
    setQuantity('1');
    setAddressId('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">
          Entrada de Mercadorias (Putaway)
        </h3>
        <p className="text-xs text-slate-500">
          Aloque um produto em qualquer uma das{' '}
          <span className="font-mono tabular-nums font-medium text-slate-700">
            {freePositionsCount}
          </span>{' '}
          posições livres.
        </p>
      </div>

      {blockedSelectionNotice && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" aria-hidden="true" />
          <span>{blockedSelectionNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2 p-3 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="putaway-sku" className="block text-xs font-medium text-slate-700">
          Código / SKU *
        </label>
        <input
          id="putaway-sku"
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="Ex.: SKU-1042"
          className="w-full px-3 py-2 text-sm font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="putaway-name" className="block text-xs font-medium text-slate-700">
          Nome do produto *
        </label>
        <input
          id="putaway-name"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Ex.: Caixa de Parafusos M8"
          className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="putaway-qty" className="block text-xs font-medium text-slate-700">
          Quantidade *
        </label>
        <input
          id="putaway-qty"
          type="number"
          min="1"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Ex.: 24"
          className="w-full px-3 py-2 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="putaway-address" className="block text-xs font-medium text-slate-700">
          Endereço de destino (somente posições livres) *
        </label>
        <select
          id="putaway-address"
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          disabled={freePositionsCount === 0}
          className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="">
            {freePositionsCount === 0
              ? 'Sem posições livres disponíveis'
              : 'Selecione um endereço livre...'}
          </option>
          {WAREHOUSE_CONFIG.aisles.map((aisleLetter) => {
            const aisleCode = `RUA-${aisleLetter}`;
            const aislePositions = positions.filter(
              (p) => p.aisleCode === aisleCode
            );

            return (
              <optgroup key={aisleCode} label={`Rua ${aisleLetter} (${aisleCode})`}>
                {aislePositions.map((pos) => {
                  const isFree = pos.status === PositionStatus.LIVRE;
                  const suffix =
                    pos.status === PositionStatus.OCUPADO
                      ? ` — Ocupado (${pos.item?.sku ?? ''})`
                      : pos.status === PositionStatus.INDISPONIVEL
                        ? ' — Indisponível'
                        : '';

                  return (
                    <option key={pos.id} value={pos.id} disabled={!isFree}>
                      {pos.fullAddress}
                      {suffix}
                    </option>
                  );
                })}
              </optgroup>
            );
          })}
        </select>
        <p className="text-[11px] text-slate-500">
          Dica: você também pode clicar em qualquer posição livre no mapa para
          preencher este campo.
        </p>
      </div>

      <button
        type="submit"
        disabled={freePositionsCount === 0}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Confirmar Entrada no Armazém
      </button>
    </form>
  );
}
