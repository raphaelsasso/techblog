export type EnvStatus = 'init' | 'idle' | 'busy' | 'shutdown';

export interface ExecutionEnvironment {
  id: number;
  status: EnvStatus;
  createdAt: number;
  invocationCount: number;
  currentRequestId?: string;
}

export interface InvocationRecord {
  requestId: string;
  envId: number;
  coldStart: boolean;
  startedAt: number;
  durationMs: number;
  billedDurationMs: number;
  initDurationMs: number;
  memoryMb: number;
  gbSeconds: number;
  status: 'success' | 'throttled';
}

export interface LambdaConfig {
  memoryMb: number;
  executionDurationMs: number;
  initDurationMs: number;
}

export const MEMORY_OPTIONS = [128, 256, 512, 1024, 2048, 4096, 10240] as const;
export const DEFAULT_CONFIG: LambdaConfig = {
  memoryMb: 512,
  executionDurationMs: 700,
  initDurationMs: 900,
};

export const CONCURRENCY_LIMIT = 10;
export const IDLE_TIMEOUT_MS = 12000;
export const PRICE_PER_GB_SEC = 0.0000166667;

export function generateRequestId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 16; i++) id += hex[Math.floor(Math.random() * 16)];
  return id;
}

export function calculateBilledDuration(actualMs: number): number {
  return Math.max(1, Math.round(actualMs));
}

export function calculateGbSeconds(billedMs: number, memoryMb: number): number {
  return (billedMs / 1000) * (memoryMb / 1024);
}

export function calculateCost(gbSeconds: number): number {
  return gbSeconds * PRICE_PER_GB_SEC;
}

export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(8)}`;
  return `$${cost.toFixed(4)}`;
}
