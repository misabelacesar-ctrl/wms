import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { InventorySearch } from './components/InventorySearch';
import { MetricsStrip } from './components/MetricsStrip';
import { PickingConfirmModal } from './components/PickingConfirmModal';
import { PositionInspector } from './components/PositionInspector';
import { PutawayForm } from './components/PutawayForm';
import { TopBar } from './components/TopBar';
import { WarehouseMap } from './components/WarehouseMap';
import {
  calculateWarehouseMetrics,
  executePicking,
  executePutaway,
  togglePositionAvailability,
} from './domain/warehouseEngine';
import {
  loadWarehousePositions,
  resetWarehousePositions,
  saveWarehousePositions,
} from './storage/wmsStorage';
import { PositionStatus, PutawayInput, WarehousePosition } from './types/wms';

type OperationTab = 'posicao' | 'entrada' | 'busca';

export default function App() {
  const [positions, setPositions] = useState<WarehousePosition[]>(() =>
    loadWarehousePositions()
  );
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OperationTab>('entrada');
  const [preselectedPutawayAddressId, setPreselectedPutawayAddressId] =
    useState<string | null>(null);
  const [blockedSelectionNotice, setBlockedSelectionNotice] = useState<
    string | null
  >(null);
  const [pickingTarget, setPickingTarget] = useState<WarehousePosition | null>(
    null
  );
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const operationsPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    saveWarehousePositions(positions);
  }, [positions]);

  const metrics = calculateWarehouseMetrics(positions);
  const selectedPosition =
    positions.find((p) => p.id === selectedPositionId) ?? null;

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function focusOperationsPanel(tab: OperationTab) {
    setActiveTab(tab);
    setBlockedSelectionNotice(null);
    if (window.innerWidth < 1024 && operationsPanelRef.current) {
      operationsPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  function handleSelectPositionFromMap(position: WarehousePosition) {
    setSelectedPositionId(position.id);
    setFeedbackBanner(null);

    if (activeTab === 'entrada') {
      if (position.status === PositionStatus.LIVRE) {
        setPreselectedPutawayAddressId(position.id);
        setBlockedSelectionNotice(null);
      } else if (position.status === PositionStatus.OCUPADO) {
        setBlockedSelectionNotice(
          `Entrada bloqueada: a posição ${position.fullAddress} já está ocupada pelo SKU ${position.item?.sku ?? ''}. Selecione uma posição livre ou acesse a aba Posição para realizar o picking.`
        );
      } else {
        setBlockedSelectionNotice(
          `Entrada bloqueada: a posição ${position.fullAddress} está marcada como indisponível. Selecione uma posição livre ou desbloqueie-a na aba Posição.`
        );
      }
      return;
    }

    setBlockedSelectionNotice(null);
    setActiveTab('posicao');
  }

  function handleStartPutawayAtAddress(addressId: string) {
    setPreselectedPutawayAddressId(addressId);
    setBlockedSelectionNotice(null);
    setActiveTab('entrada');
  }

  function handleSubmitPutaway(input: PutawayInput) {
    const result = executePutaway(positions, input);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    setPositions(result.positions);
    setSelectedPositionId(input.addressId);
    setPreselectedPutawayAddressId(null);
    setBlockedSelectionNotice(null);
    setFeedbackBanner({
      type: 'success',
      message: `Recebimento registrado: ${input.sku.trim().toUpperCase()} (${input.quantity.toLocaleString('pt-BR')} un.) alocado em ${input.addressId}.`,
    });

    return { ok: true };
  }

  function handleToggleAvailability(addressId: string) {
    const result = togglePositionAvailability(positions, addressId);
    if (!result.ok || !result.data) {
      setFeedbackBanner({
        type: 'error',
        message: result.error ?? 'Não foi possível alterar o status da posição.',
      });
      return;
    }

    setPositions(result.positions);
    const updated = result.data;
    setFeedbackBanner({
      type: 'success',
      message:
        updated.status === PositionStatus.INDISPONIVEL
          ? `Posição ${updated.fullAddress} marcada como indisponível.`
          : `Posição ${updated.fullAddress} liberada e disponível para alocação.`,
    });
  }

  function handleConfirmPicking(addressId: string) {
    const result = executePicking(positions, addressId);
    if (!result.ok || !result.data) {
      setFeedbackBanner({
        type: 'error',
        message: result.error ?? 'Não foi possível registrar o picking.',
      });
      setPickingTarget(null);
      return;
    }

    setPositions(result.positions);
    setPickingTarget(null);
    setSelectedPositionId(result.data.releasedPosition.id);
    setFeedbackBanner({
      type: 'success',
      message: `Picking confirmado: ${result.data.pickedItem.sku} retirado de ${result.data.releasedPosition.fullAddress}. Posição liberada no mapa.`,
    });
  }

  function handleResetWarehouse() {
    const fresh = resetWarehousePositions();
    setPositions(fresh);
    setSelectedPositionId(null);
    setPreselectedPutawayAddressId(null);
    setBlockedSelectionNotice(null);
    setPickingTarget(null);
    setFeedbackBanner({
      type: 'success',
      message: 'Armazém reiniciado com 150 posições livres.',
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        onNavigateSection={scrollToSection}
        onOpenPutaway={() => focusOperationsPanel('entrada')}
        onOpenSearch={() => focusOperationsPanel('busca')}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Controle Operacional de Armazém
            </h1>
            <p className="text-sm text-slate-600">
              Visão em tempo real das 150 posições porta-paletes, recebimento,
              picking e consulta por SKU.
            </p>
          </div>
        </div>

        {feedbackBanner && (
          <div
            role={feedbackBanner.type === 'error' ? 'alert' : 'status'}
            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm rounded-xl border ${
              feedbackBanner.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{feedbackBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              aria-label="Fechar aviso"
              className="p-1 rounded hover:bg-black/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <MetricsStrip metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <WarehouseMap
              positions={positions}
              selectedPositionId={selectedPositionId}
              onSelectPosition={handleSelectPositionFromMap}
              onResetWarehouse={handleResetWarehouse}
            />
          </div>

          <aside
            ref={operationsPanelRef}
            aria-label="Painel de operações do armazém"
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 lg:sticky lg:top-22"
          >
            <div
              className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg"
              role="tablist"
              aria-label="Operações do armazém"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'entrada'}
                onClick={() => {
                  setActiveTab('entrada');
                  setBlockedSelectionNotice(null);
                }}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'entrada'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entrada
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'posicao'}
                onClick={() => {
                  setActiveTab('posicao');
                  setBlockedSelectionNotice(null);
                }}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'posicao'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Posição
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'busca'}
                onClick={() => {
                  setActiveTab('busca');
                  setBlockedSelectionNotice(null);
                }}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'busca'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Busca
              </button>
            </div>

            {activeTab === 'entrada' && (
              <PutawayForm
                positions={positions}
                preselectedAddressId={preselectedPutawayAddressId}
                blockedSelectionNotice={blockedSelectionNotice}
                onSubmitPutaway={handleSubmitPutaway}
              />
            )}

            {activeTab === 'posicao' && (
              <PositionInspector
                position={selectedPosition}
                onStartPutawayAtAddress={handleStartPutawayAtAddress}
                onRequestPicking={(pos) => setPickingTarget(pos)}
                onToggleAvailability={handleToggleAvailability}
              />
            )}

            {activeTab === 'busca' && (
              <InventorySearch
                positions={positions}
                occupiedTotal={metrics.occupiedPositions}
                onSelectPositionOnMap={(pos) => {
                  setSelectedPositionId(pos.id);
                  setActiveTab('posicao');
                  scrollToSection('mapa-armazem');
                }}
                onRequestPicking={(pos) => setPickingTarget(pos)}
                onGoToPutaway={() => focusOperationsPanel('entrada')}
              />
            )}
          </aside>
        </div>
      </main>

      <PickingConfirmModal
        position={pickingTarget}
        onCancel={() => setPickingTarget(null)}
        onConfirm={handleConfirmPicking}
      />
    </div>
  );
}
