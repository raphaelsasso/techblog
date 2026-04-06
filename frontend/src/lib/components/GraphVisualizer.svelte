<script lang="ts">
  import { t } from '$lib/i18n';
  import type { TaoObject, TaoAssociation, ObjectType } from '$lib/services/social-graph';
  import { getObjectLabel } from '$lib/services/social-graph';

  interface Props {
    objects: TaoObject[];
    associations: TaoAssociation[];
  }

  let { objects, associations }: Props = $props();

  const TYPE_COLORS: Record<ObjectType, string> = {
    USER: '#58a6ff',
    POST: '#3fb950',
    PHOTO: '#d29922',
    COMMENT: '#bc8cff',
    CHECKIN: '#f85149',
  };

  const TYPE_ICONS: Record<ObjectType, string> = {
    USER: '👤',
    POST: '📝',
    PHOTO: '📷',
    COMMENT: '💬',
    CHECKIN: '📍',
  };

  const WIDTH = 700;
  const HEIGHT = 400;
  const NODE_RADIUS = 28;

  interface NodePos {
    x: number;
    y: number;
    obj: TaoObject;
  }

  let nodePositions = $derived.by(() => {
    const count = objects.length;
    if (count === 0) return [] as NodePos[];

    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const radiusX = Math.min(WIDTH * 0.38, 260);
    const radiusY = Math.min(HEIGHT * 0.35, 150);

    return objects.map((obj, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      return {
        x: cx + radiusX * Math.cos(angle),
        y: cy + radiusY * Math.sin(angle),
        obj,
      };
    });
  });

  function getNodePos(id: number): NodePos | undefined {
    return nodePositions.find((n) => n.obj.id === id);
  }

  interface EdgePath {
    assoc: TaoAssociation;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    mx: number;
    my: number;
    label: string;
  }

  let edges = $derived.by(() => {
    const result: EdgePath[] = [];
    const edgeCounts = new Map<string, number>();

    for (const a of associations) {
      const from = getNodePos(a.id1);
      const to = getNodePos(a.id2);
      if (!from || !to) continue;

      const pairKey = [Math.min(a.id1, a.id2), Math.max(a.id1, a.id2)].join('-');
      const count = edgeCounts.get(pairKey) ?? 0;
      edgeCounts.set(pairKey, count + 1);

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const offset = count * 18;

      const mx = (from.x + to.x) / 2 + nx * offset;
      const my = (from.y + to.y) / 2 + ny * offset;

      result.push({
        assoc: a,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        mx,
        my,
        label: a.type,
      });
    }
    return result;
  });
</script>

<section class="graph-viz">
  <h3 class="graph-title">
    <span class="graph-icon">🕸️</span>
    {t('socialGraph.graphTitle')}
  </h3>

  {#if objects.length === 0}
    <p class="graph-empty">{t('socialGraph.noObjects')}</p>
  {:else}
    <div class="graph-container">
      <svg viewBox="0 0 {WIDTH} {HEIGHT}" class="graph-svg">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)" />
          </marker>
        </defs>

        {#each edges as edge (edge.assoc.id1 + '-' + edge.assoc.type + '-' + edge.assoc.id2)}
          <path
            d="M {edge.x1} {edge.y1} Q {edge.mx} {edge.my} {edge.x2} {edge.y2}"
            fill="none"
            stroke="var(--border)"
            stroke-width="1.5"
            marker-end="url(#arrowhead)"
          />
          <text
            x={edge.mx}
            y={edge.my - 6}
            text-anchor="middle"
            class="edge-label"
          >
            {edge.label}
          </text>
        {/each}

        {#each nodePositions as node (node.obj.id)}
          <circle
            cx={node.x}
            cy={node.y}
            r={NODE_RADIUS}
            fill="var(--bg-tertiary)"
            stroke={TYPE_COLORS[node.obj.type]}
            stroke-width="2"
          />
          <text x={node.x} y={node.y - 4} text-anchor="middle" class="node-icon">
            {TYPE_ICONS[node.obj.type]}
          </text>
          <text x={node.x} y={node.y + 14} text-anchor="middle" class="node-label">
            {getObjectLabel(node.obj)}
          </text>
        {/each}
      </svg>
    </div>

    <div class="legend">
      {#each Object.entries(TYPE_COLORS) as [type, color]}
        <div class="legend-item">
          <span class="legend-dot" style="background: {color}"></span>
          <span class="legend-text">{type}</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .graph-viz {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .graph-title {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .graph-icon {
    font-size: 1rem;
  }

  .graph-empty {
    font-size: 0.8125rem;
    color: var(--text-muted);
    text-align: center;
    padding: 2rem 1rem;
    font-family: var(--font-mono);
  }

  .graph-container {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .graph-svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .graph-svg :global(.edge-label) {
    font-family: var(--font-mono);
    font-size: 9px;
    fill: var(--text-muted);
    font-weight: 600;
  }

  .graph-svg :global(.node-icon) {
    font-size: 14px;
    dominant-baseline: central;
  }

  .graph-svg :global(.node-label) {
    font-family: var(--font-mono);
    font-size: 10px;
    fill: var(--text-primary);
    font-weight: 600;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-text {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 640px) {
    .graph-container {
      overflow-x: auto;
    }

    .graph-svg {
      min-width: 500px;
    }
  }
</style>
