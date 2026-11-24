export const WAREHOUSE_CONFIG = {
  aisles: ['A', 'B', 'C', 'D', 'E', 'F'] as const,
  modulesPerAisle: 5,
  levelsPerModule: 5,
} as const;

export const EXPECTED_TOTAL_POSITIONS =
  WAREHOUSE_CONFIG.aisles.length *
  WAREHOUSE_CONFIG.modulesPerAisle *
  WAREHOUSE_CONFIG.levelsPerModule;

export function formatAisleCode(aisleLetter: string): string {
  return `RUA-${aisleLetter}`;
}

export function formatAisleLabel(aisleLetter: string): string {
  return `Rua ${aisleLetter}`;
}

export function formatModuleCode(moduleNumber: number): string {
  return `MOD-${String(moduleNumber).padStart(2, '0')}`;
}

export function formatLevelCode(levelNumber: number): string {
  return `NIVEL-${levelNumber}`;
}

export function formatFullAddress(
  aisleCode: string,
  moduleCode: string,
  levelCode: string
): string {
  return `${aisleCode} / ${moduleCode} / ${levelCode}`;
}
