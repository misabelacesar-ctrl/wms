import { useState } from 'react';
import { ArrowUpFromLine, MapPin, Search, X } from 'lucide-react';
import { searchInventory } from '../domain/warehouseEngine';
import { WarehousePosition } from '../types/wms';

interface InventorySearchProps {
  positions: WarehousePosition[];
  occupiedTotal: number;
  onSelectPositionOnMap: (position: WarehousePosition) => void;
  onRequestPicking: (position: WarehousePosition) => void;
  onGoToPutaway: () => void;
}

export function InventorySearch({
  positions,
  occupiedTotal,
  onSelectPositionOnMap,
  onRequestPicking,
  onGoToPutaway,
}: InventorySearchProps) {
  const [query, setQuery] = useState('');
  const results = searchInventory(positions, query);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">
          Consulta e Busca de Estoque
        </h3>
        <p className="text-xs text-slate-500">
          Pesquise por Código/SKU ou Nome para localizar rua, módulo e nível.
        </p>
      </div>

      <div className="relative">
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por SKU ou nome do produto..."
          aria-label="Buscar por Código/SKU ou nome do produto"
          className="w-full pl-9 pr-9 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpar busca"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {occupiedTotal === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-slate-300 rounded-lg space-y-3">
          <p className="text-sm font-medium text-slate-800">
            Nenhum produto armazenado
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            O armazém está vazio. Registre uma entrada de mercadoria para começar
            a consultar endereços.
          </p>
          <button
            type="button"
            onClick={onGoToPutaway}
            className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Registrar Primeira Entrada
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-slate-300 rounded-lg space-y-2.5">
          <p className="text-sm font-medium text-slate-800">
            Nenhum resultado para &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-slate-500">
            Verifique o Código/SKU ou tente outro termo do nome do produto.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            {results.length}{' '}
            {results.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>

          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-[420px] overflow-y-auto">
            {results.map(({ position, item }) => (
              <li key={position.id} className="p-3.5 space-y-2.5 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-blue-700">
                      {item.sku}
                    </p>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.productName}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-slate-800 shrink-0">
                    {item.quantity.toLocaleString('pt-BR')} un.
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-mono font-medium text-slate-900">
                    {position.fullAddress}
                  </p>
                  <p>
                    {position.aisleLabel} · Módulo {position.moduleCode} · Nível{' '}
                    {position.levelNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectPositionOnMap(position)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    Ver no mapa
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestPicking(position)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <ArrowUpFromLine className="w-3.5 h-3.5" aria-hidden="true" />
                    Picking
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
