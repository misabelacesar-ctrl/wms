export enum PositionStatus {
  LIVRE = 'LIVRE',
  OCUPADO = 'OCUPADO',
  INDISPONIVEL = 'INDISPONIVEL',
}

export interface StoredItem {
  sku: string;
  productName: string;
  quantity: number;
  storedAt: string;
}

export interface WarehousePosition {
  id: string;
  aisleCode: string;
  aisleLabel: string;
  moduleNumber: number;
  moduleCode: string;
  levelNumber: number;
  levelCode: string;
  fullAddress: string;
  status: PositionStatus;
  item: StoredItem | null;
}

export interface WarehouseMetrics {
  totalPositions: number;
  usablePositions: number;
  freePositions: number;
  occupiedPositions: number;
  unavailablePositions: number;
  occupancyRate: number;
}

export interface PutawayInput {
  sku: string;
  productName: string;
  quantity: number;
  addressId: string;
}

export interface EngineResult<T = undefined> {
  ok: boolean;
  error?: string;
  positions: WarehousePosition[];
  data?: T;
}

export interface SearchResultItem {
  position: WarehousePosition;
  item: StoredItem;
}
