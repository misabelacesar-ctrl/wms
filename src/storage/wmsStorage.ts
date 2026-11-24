import { WarehousePosition } from '../types/wms';
import {
  generateWarehousePositions,
  isValidWarehouseSnapshot,
} from '../domain/warehouseEngine';

const STORAGE_KEY = 'wms_armazem_posicoes_v1';

export function loadWarehousePositions(): WarehousePosition[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return generateWarehousePositions();
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isValidWarehouseSnapshot(parsed)) {
      return generateWarehousePositions();
    }

    return parsed;
  } catch {
    return generateWarehousePositions();
  }
}

export function saveWarehousePositions(positions: WarehousePosition[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Falha silenciosa apenas quando localStorage estiver bloqueado pelo navegador
  }
}

export function resetWarehousePositions(): WarehousePosition[] {
  const freshPositions = generateWarehousePositions();
  saveWarehousePositions(freshPositions);
  return freshPositions;
}
