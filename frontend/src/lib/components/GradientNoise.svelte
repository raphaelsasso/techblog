<script lang="ts">
  let canvas: HTMLCanvasElement;

  interface Orb {
    x: number;
    y: number;
    radius: number;
    color: [number, number, number];
    xSpeed: number;
    ySpeed: number;
    xPhase: number;
    yPhase: number;
    pulseSpeed: number;
    pulsePhase: number;
  }

  interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    drift: number;
    phase: number;
  }

  function createScene(ctx: CanvasRenderingContext2D) {
    let animationId: number;
    let time = 0;
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;

    const orbs: Orb[] = [
      { x: 0.2, y: 0.25, radius: 0.55, color: [88, 166, 255], xSpeed: 0.008, ySpeed: 0.006, xPhase: 0, yPhase: 0, pulseSpeed: 0.003, pulsePhase: 0 },
      { x: 0.75, y: 0.35, radius: 0.5, color: [188, 140, 255], xSpeed: 0.006, ySpeed: 0.009, xPhase: 2.1, yPhase: 1.3, pulseSpeed: 0.004, pulsePhase: 1 },
      { x: 0.5, y: 0.7, radius: 0.45, color: [63, 185, 80], xSpeed: 0.009, ySpeed: 0.005, xPhase: 4.2, yPhase: 3.1, pulseSpeed: 0.0035, pulsePhase: 2.5 },
      { x: 0.15, y: 0.8, radius: 0.4, color: [210, 153, 34], xSpeed: 0.005, ySpeed: 0.007, xPhase: 1.5, yPhase: 5.2, pulseSpeed: 0.005, pulsePhase: 3.8 },
      { x: 0.85, y: 0.15, radius: 0.42, color: [248, 81, 73], xSpeed: 0.007, ySpeed: 0.0055, xPhase: 3.3, yPhase: 2.4, pulseSpeed: 0.0045, pulsePhase: 5 },
      { x: 0.5, y: 0.3, radius: 0.38, color: [139, 233, 253], xSpeed: 0.004, ySpeed: 0.008, xPhase: 5.5, yPhase: 0.7, pulseSpeed: 0.003, pulsePhase: 1.5 },
    ];

    const PARTICLE_COUNT = 60;
    let particles: Particle[] = [];

    function spawnParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.0003 + 0.0001,
        opacity: Math.random() * 0.4 + 0.1,
        drift: (Math.random() - 0.5) * 0.0002,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    spawnParticles();

    function render() {
      w = ctx.canvas.width;
      h = ctx.canvas.height;

      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';

      for (const orb of orbs) {
        const pulse = 1 + Math.sin(time * orb.pulseSpeed + orb.pulsePhase) * 0.15;
        const cx = (orb.x + Math.sin(time * orb.xSpeed + orb.xPhase) * 0.25) * w;
        const cy = (orb.y + Math.cos(time * orb.ySpeed + orb.yPhase) * 0.2) * h;
        const r = orb.radius * Math.max(w, h) * pulse;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.14)`);
        gradient.addColorStop(0.35, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.06)`);
        gradient.addColorStop(0.7, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.02)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = 'source-over';

      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(time * 0.008 + p.phase) * p.drift;

        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        const flicker = 0.7 + Math.sin(time * 0.01 + p.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 237, 243, ${p.opacity * flicker})`;
        ctx.fill();
      }

      drawVignette(ctx, w, h);

      time += 1;
      animationId = requestAnimationFrame(render);
    }

    function drawVignette(c: CanvasRenderingContext2D, vw: number, vh: number) {
      const gradient = c.createRadialGradient(vw / 2, vh / 2, vw * 0.25, vw / 2, vh / 2, vw * 0.85);
      gradient.addColorStop(0, 'rgba(13, 17, 23, 0)');
      gradient.addColorStop(1, 'rgba(13, 17, 23, 0.7)');
      c.fillStyle = gradient;
      c.fillRect(0, 0, vw, vh);
    }

    render();
    return () => cancelAnimationFrame(animationId);
  }

  $effect(() => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cleanup: (() => void) | undefined;

    function init() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (cleanup) cleanup();
      cleanup = createScene(ctx!);
    }

    init();

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    }

    window.addEventListener('resize', onResize);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
  }
</style>
