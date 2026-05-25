import { PRICE_PER_GB_SEC } from './lambda';

export type TrafficPattern = 'steady' | 'spike' | 'ramp';

export type EnvironmentState = 'init' | 'idle' | 'busy' | 'shutdown';

export interface ScalingEnvironment {
  id: number;
  state: EnvironmentState;
  provisioned: boolean;
  bornAtTick: number;
  invocationsServed: number;
}

export interface ScalingInvocation {
  id: number;
  tick: number;
  status: 'success' | 'throttled-burst' | 'throttled-account';
  coldStart: boolean;
  envId?: number;
}

export interface ScalingSample {
  tick: number;
  active: number;
  burstBudget: number;
  arrivals: number;
  throttled: number;
}

export interface ScalingConfig {
  pattern: TrafficPattern;
  targetRps: number;
  reservedConcurrency: number;
  provisionedConcurrency: number;
  accountLimit: number;
  executionDurationMs: number;
  memoryMb: number;
}

export interface ScalingTotals {
  totalRequests: number;
  successful: number;
  throttledBurst: number;
  throttledAccount: number;
  coldStarts: number;
  warmStarts: number;
}

export const TICK_MS = 200;
export const TICKS_PER_SECOND = 1000 / TICK_MS;
export const SIM_WINDOW_SECONDS = 60;
export const MAX_TICKS = SIM_WINDOW_SECONDS * TICKS_PER_SECOND;

export const DEFAULT_INITIAL_BURST = 1000;
export const SCALING_RATE_PER_MINUTE = 500;
export const SCALING_RATE_PER_TICK =
  SCALING_RATE_PER_MINUTE / (60 * TICKS_PER_SECOND);

export const DEFAULT_ACCOUNT_LIMIT = 1000;
export const MAX_ACCOUNT_LIMIT = 5000;
export const MAX_RESERVED = 1000;
export const MAX_PROVISIONED = 500;

export const PROVISIONED_PRICE_PER_GB_HOUR = 0.000004;
export const PROVISIONED_INVOKE_PRICE_PER_GB_SEC = 0.0000041667;

export const DEFAULT_SCALING_CONFIG: ScalingConfig = {
  pattern: 'spike',
  targetRps: 200,
  reservedConcurrency: 0,
  provisionedConcurrency: 0,
  accountLimit: DEFAULT_ACCOUNT_LIMIT,
  executionDurationMs: 400,
  memoryMb: 512,
};

export function arrivalsAtTick(config: ScalingConfig, tick: number): number {
  const second = tick / TICKS_PER_SECOND;
  let perSecond: number;
  switch (config.pattern) {
    case 'steady':
      perSecond = config.targetRps;
      break;
    case 'spike': {
      const baseline = config.targetRps * 0.1;
      const inSpike = second >= 8 && second <= 14;
      perSecond = inSpike ? config.targetRps : baseline;
      break;
    }
    case 'ramp': {
      const progress = Math.min(1, second / 30);
      perSecond = config.targetRps * progress;
      break;
    }
  }
  const perTick = perSecond / TICKS_PER_SECOND;
  const whole = Math.floor(perTick);
  const remainder = perTick - whole;
  return whole + (Math.random() < remainder ? 1 : 0);
}

export function executionTicks(config: ScalingConfig): number {
  return Math.max(1, Math.round(config.executionDurationMs / TICK_MS));
}

export function effectiveAccountLimit(config: ScalingConfig): number {
  if (config.reservedConcurrency === 0) return config.accountLimit;
  return Math.max(0, config.accountLimit - config.reservedConcurrency);
}

export function functionUnreservedCeiling(config: ScalingConfig): number {
  return effectiveAccountLimit(config);
}

export function functionTotalCeiling(config: ScalingConfig): number {
  if (config.reservedConcurrency > 0) return config.reservedConcurrency;
  return config.accountLimit;
}

export function computeCost(
  successful: number,
  executionMs: number,
  memoryMb: number,
): number {
  const seconds = executionMs / 1000;
  const gbSecPerInvoke = seconds * (memoryMb / 1024);
  return successful * gbSecPerInvoke * PRICE_PER_GB_SEC;
}

export function provisionedHourlyCost(
  provisioned: number,
  memoryMb: number,
): number {
  return provisioned * (memoryMb / 1024) * PROVISIONED_PRICE_PER_GB_HOUR * 3600;
}

export function provisionedMonthlyCost(
  provisioned: number,
  memoryMb: number,
): number {
  return provisionedHourlyCost(provisioned, memoryMb) * 24 * 30;
}

export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  if (cost < 1) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export function formatRps(rps: number): string {
  if (rps >= 1000) return `${(rps / 1000).toFixed(1)}k`;
  return `${Math.round(rps)}`;
}
