import {
  EngineResult,
  PositionStatus,
  PutawayInput,
  SearchResultItem,
  StoredItem,
  WarehouseMetrics,
  WarehousePosition,
} from '../types/wms';
import {
  EXPECTED_TOTAL_POSITIONS,
  WAREHOUSE_CONFIG,
  formatAisleCode,
  formatAisleLabel,
  formatFullAddress,
  formatLevelCode,
  formatModuleCode,
} from './warehouseConfig';

/**
 * Gera exatamente 150 posições (6 ruas × 5 módulos × 5 níveis)
 * a partir das constantes de configuração física do armazém.
 */
export function generateWarehousePositions(): WarehousePosition[] {
  const positions: WarehousePosition[] = [];

  for (const aisleLetter of WAREHOUSE_CONFIG.aisles) {
    const aisleCode = formatAisleCode(aisleLetter);
    const aisleLabel = formatAisleLabel(aisleLetter);

    for (let moduleNum = 1; moduleNum <= WAREHOUSE_CONFIG.modulesPerAisle; moduleNum++) {
      const moduleCode = formatModuleCode(moduleNum);

      for (let levelNum = 1; levelNum <= WAREHOUSE_CONFIG.levelsPerModule; levelNum++) {
        const levelCode = formatLevelCode(levelNum);
        const fullAddress = formatFullAddress(aisleCode, moduleCode, levelCode);

        positions.push({
          id: fullAddress,
          aisleCode,
          aisleLabel,
          moduleNumber: moduleNum,
          moduleCode,
          levelNumber: levelNum,
          levelCode,
          fullAddress,
          status: PositionStatus.LIVRE,
          item: null,
        });
      }
    }
  }

  return positions;
}

/**
 * Taxa de ocupação considera posições ocupadas sobre o total de posições utilizáveis
 * (total de posições menos posições marcadas como indisponíveis).
 */
export function calculateWarehouseMetrics(positions: WarehousePosition[]): WarehouseMetrics {
  const totalPositions = positions.length;
  let freePositions = 0;
  let occupiedPositions = 0;
  let unavailablePositions = 0;

  for (const pos of positions) {
    if (pos.status === PositionStatus.LIVRE) {
      freePositions += 1;
    } else if (pos.status === PositionStatus.OCUPADO) {
      occupiedPositions += 1;
    } else if (pos.status === PositionStatus.INDISPONIVEL) {
      unavailablePositions += 1;
    }
  }

  const usablePositions = totalPositions - unavailablePositions;
  const occupancyRate = usablePositions > 0 ? (occupiedPositions / usablePositions) * 100 : 0;

  return {
    totalPositions,
    usablePositions,
    freePositions,
    occupiedPositions,
    unavailablePositions,
    occupancyRate,
  };
}

export function validatePutawayInput(
  positions: WarehousePosition[],
  input: PutawayInput
): string | null {
  const trimmedSku = input.sku.trim();
  const trimmedName = input.productName.trim();

  if (!trimmedSku) {
    return 'Informe o Código/SKU do produto.';
  }

  if (!trimmedName) {
    return 'Informe o Nome do produto.';
  }

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return 'A quantidade deve ser maior que zero.';
  }

  if (!input.addressId) {
    return 'Selecione um endereço de destino livre.';
  }

  const targetPosition = positions.find((pos) => pos.id === input.addressId);
  if (!targetPosition) {
    return 'Endereço de destino não encontrado no mapa do armazém.';
  }

  if (targetPosition.status === PositionStatus.OCUPADO) {
    return `Entrada bloqueada: a posição ${targetPosition.fullAddress} já está ocupada pelo SKU ${targetPosition.item?.sku ?? ''}.`;
  }

  if (targetPosition.status === PositionStatus.INDISPONIVEL) {
    return `Entrada bloqueada: a posição ${targetPosition.fullAddress} está marcada como indisponível.`;
  }

  return null;
}

export function executePutaway(
  positions: WarehousePosition[],
  input: PutawayInput
): EngineResult<WarehousePosition> {
  const validationError = validatePutawayInput(positions, input);
  if (validationError) {
    return {
      ok: false,
      error: validationError,
      positions,
    };
  }

  const newItem: StoredItem = {
    sku: input.sku.trim().toUpperCase(),
    productName: input.productName.trim(),
    quantity: input.quantity,
    storedAt: new Date().toISOString(),
  };

  let updatedTarget: WarehousePosition | undefined;
  const nextPositions = positions.map((pos) => {
    if (pos.id !== input.addressId) {
      return pos;
    }
    updatedTarget = {
      ...pos,
      status: PositionStatus.OCUPADO,
      item: newItem,
    };
    return updatedTarget;
  });

  return {
    ok: true,
    positions: nextPositions,
    data: updatedTarget,
  };
}

export function executePicking(
  positions: WarehousePosition[],
  addressId: string
): EngineResult<{ releasedPosition: WarehousePosition; pickedItem: StoredItem }> {
  const targetPosition = positions.find((pos) => pos.id === addressId);

  if (!targetPosition) {
    return {
      ok: false,
      error: 'Posição não encontrada no armazém.',
      positions,
    };
  }

  if (targetPosition.status !== PositionStatus.OCUPADO || !targetPosition.item) {
    return {
      ok: false,
      error: `A posição ${targetPosition.fullAddress} não possui mercadoria ocupada para picking.`,
      positions,
    };
  }

  const pickedItem = targetPosition.item;
  let releasedPosition: WarehousePosition = targetPosition;

  const nextPositions = positions.map((pos) => {
    if (pos.id !== addressId) {
      return pos;
    }
    releasedPosition = {
      ...pos,
      status: PositionStatus.LIVRE,
      item: null,
    };
    return releasedPosition;
  });

  return {
    ok: true,
    positions: nextPositions,
    data: {
      releasedPosition,
      pickedItem,
    },
  };
}

export function togglePositionAvailability(
  positions: WarehousePosition[],
  addressId: string
): EngineResult<WarehousePosition> {
  const targetPosition = positions.find((pos) => pos.id === addressId);

  if (!targetPosition) {
    return {
      ok: false,
      error: 'Posição não encontrada no armazém.',
      positions,
    };
  }

  if (targetPosition.status === PositionStatus.OCUPADO) {
    return {
      ok: false,
      error: `Não é possível marcar ${targetPosition.fullAddress} como indisponível enquanto estiver ocupada. Realize o picking primeiro.`,
      positions,
    };
  }

  const nextStatus =
    targetPosition.status === PositionStatus.INDISPONIVEL
      ? PositionStatus.LIVRE
      : PositionStatus.INDISPONIVEL;

  let updatedPosition: WarehousePosition = targetPosition;
  const nextPositions = positions.map((pos) => {
    if (pos.id !== addressId) {
      return pos;
    }
    updatedPosition = {
      ...pos,
      status: nextStatus,
    };
    return updatedPosition;
  });

  return {
    ok: true,
    positions: nextPositions,
    data: updatedPosition,
  };
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchInventory(
  positions: WarehousePosition[],
  rawQuery: string
): SearchResultItem[] {
  const query = normalizeText(rawQuery);
  const occupied = positions.filter(
    (pos): pos is WarehousePosition & { item: StoredItem } =>
      pos.status === PositionStatus.OCUPADO && pos.item !== null
  );

  if (!query) {
    return occupied.map((pos) => ({ position: pos, item: pos.item }));
  }

  return occupied
    .filter((pos) => {
      const skuNormalized = normalizeText(pos.item.sku);
      const nameNormalized = normalizeText(pos.item.productName);
      return skuNormalized.includes(query) || nameNormalized.includes(query);
    })
    .map((pos) => ({ position: pos, item: pos.item }));
}

export function isValidWarehouseSnapshot(data: unknown): data is WarehousePosition[] {
  if (!Array.isArray(data) || data.length !== EXPECTED_TOTAL_POSITIONS) {
    return false;
  }

  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.fullAddress === 'string' &&
      (item.status === PositionStatus.LIVRE ||
        item.status === PositionStatus.OCUPADO ||
        item.status === PositionStatus.INDISPONIVEL)
  );
}
