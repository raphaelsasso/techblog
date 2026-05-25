<script lang="ts">
  import { t } from '$lib/i18n';
  import { TICKS_PER_SECOND, type ScalingSample } from '$lib/services/lambda-scaling';

  interface Props {
    samples: ScalingSample[];
    accountLimit: number;
    reservedCeiling: number;
    provisioned: number;
  }

  let { samples, accountLimit, reservedCeiling, provisioned }: Props = $props();

  const WIDTH = 720;
  const HEIGHT = 220;
  const PAD_LEFT = 36;
  const PAD_RIGHT = 12;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 22;

  let plotW = $derived(WIDTH - PAD_LEFT - PAD_RIGHT);
  let plotH = $derived(HEIGHT - PAD_TOP - PAD_BOTTOM);

  let ceiling = $derived(reservedCeiling > 0 ? reservedCeiling : accountLimit);

  let maxActive = $derived(
    Math.max(10, ...samples.map((s) => s.active), Math.floor(ceiling * 0.5)),
  );

  let yAxis = $derived(maxActive);

  function xFor(tick: number, total: number): number {
    if (total <= 1) return PAD_LEFT;
    return PAD_LEFT + (tick / Math.max(1, total - 1)) * plotW;
  }

  function yFor(value: number): number {
    const clamped = Math.min(yAxis, Math.max(0, value));
    return PAD_TOP + plotH - (clamped / yAxis) * plotH;
  }

  let activePath = $derived(
    samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${xFor(i, samples.length).toFixed(2)},${yFor(s.active).toFixed(2)}`)
      .join(' '),
  );

  let throttledPoints = $derived(
    samples.flatMap((s, i) => {
      if (s.throttled === 0) return [];
      return [{ x: xFor(i, samples.length), y: yFor(s.active + s.throttled) }];
    }),
  );

  let ceilingY = $derived(yFor(ceiling));
  let provisionedY = $derived(yFor(provisioned));

  let lastSample = $derived(samples[samples.length - 1]);
  let currentActive = $derived(lastSample?.active ?? 0);
  let currentThrottled = $derived(lastSample?.throttled ?? 0);
</script>

<section class="timeline">
  <header class="timeline-header">
    <span class="header-icon">📈</span>
    <h3 class="timeline-title">{t('lambdaScaling.timelineTitle')}</h3>
    <div class="live-stats">
      <span class="stat">
        <span class="dot active-dot"></span>
        <span class="stat-label">{t('lambdaScaling.active')}</span>
        <span class="stat-value">{currentActive}</span>
      </span>
      <span class="stat">
        <span class="dot throttled-dot"></span>
        <span class="stat-label">{t('lambdaScaling.throttled')}</span>
        <span class="stat-value">{currentThrottled}</span>
      </span>
    </div>
  </header>

  <div class="chart-wrap">
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" preserveAspectRatio="none" class="chart">
      <line
        x1={PAD_LEFT}
        y1={PAD_TOP}
        x2={PAD_LEFT}
        y2={HEIGHT - PAD_BOTTOM}
        stroke="var(--border)"
        stroke-width="1"
      />
      <line
        x1={PAD_LEFT}
        y1={HEIGHT - PAD_BOTTOM}
        x2={WIDTH - PAD_RIGHT}
        y2={HEIGHT - PAD_BOTTOM}
        stroke="var(--border)"
        stroke-width="1"
      />

      {#if provisioned > 0}
        <line
          x1={PAD_LEFT}
          y1={provisionedY}
          x2={WIDTH - PAD_RIGHT}
          y2={provisionedY}
          stroke="var(--purple)"
          stroke-width="1"
          stroke-dasharray="4 4"
          opacity="0.7"
        />
        <text
          x={WIDTH - PAD_RIGHT - 4}
          y={provisionedY - 4}
          fill="var(--purple)"
          font-size="9"
          font-family="var(--font-mono)"
          text-anchor="end"
        >
          provisioned {provisioned}
        </text>
      {/if}

      <line
        x1={PAD_LEFT}
        y1={ceilingY}
        x2={WIDTH - PAD_RIGHT}
        y2={ceilingY}
        stroke="var(--red)"
        stroke-width="1"
        stroke-dasharray="6 4"
        opacity="0.8"
      />
      <text
        x={WIDTH - PAD_RIGHT - 4}
        y={ceilingY - 4}
        fill="var(--red)"
        font-size="9"
        font-family="var(--font-mono)"
        text-anchor="end"
      >
        ceiling {ceiling}
      </text>

      {#if samples.length > 1}
        <path d={activePath} fill="none" stroke="var(--accent)" stroke-width="1.5" />
      {/if}

      {#each throttledPoints as point (point.x)}
        <circle cx={point.x} cy={point.y} r="2.5" fill="var(--red)" />
      {/each}

      <text
        x={PAD_LEFT - 6}
        y={yFor(0) + 3}
        fill="var(--text-muted)"
        font-size="9"
        font-family="var(--font-mono)"
        text-anchor="end"
      >
        0
      </text>
      <text
        x={PAD_LEFT - 6}
        y={yFor(yAxis) + 3}
        fill="var(--text-muted)"
        font-size="9"
        font-family="var(--font-mono)"
        text-anchor="end"
      >
        {yAxis}
      </text>
      <text
        x={PAD_LEFT}
        y={HEIGHT - 6}
        fill="var(--text-muted)"
        font-size="9"
        font-family="var(--font-mono)"
      >
        0s
      </text>
      <text
        x={WIDTH - PAD_RIGHT}
        y={HEIGHT - 6}
        fill="var(--text-muted)"
        font-size="9"
        font-family="var(--font-mono)"
        text-anchor="end"
      >
        {(samples.length / TICKS_PER_SECOND).toFixed(0)}s
      </text>
    </svg>

    {#if samples.length === 0}
      <p class="empty-state">{t('lambdaScaling.timelineEmpty')}</p>
    {/if}
  </div>

  <p class="hint">{t('lambdaScaling.timelineHint')}</p>
</section>

<style>
  .timeline {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .timeline-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .header-icon {
    font-size: 1rem;
  }

  .timeline-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
  }

  .live-stats {
    display: flex;
    gap: 1rem;
  }

  .stat {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .active-dot {
    background: var(--accent);
  }

  .throttled-dot {
    background: var(--red);
  }

  .stat-label {
    color: var(--text-muted);
  }

  .stat-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .chart-wrap {
    position: relative;
    width: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .chart {
    display: block;
    width: 100%;
    height: auto;
  }

  .empty-state {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
    pointer-events: none;
  }

  .hint {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin-top: 0.75rem;
  }
</style>
