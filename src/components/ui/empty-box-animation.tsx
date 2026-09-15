'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyBoxAnimationProps extends React.ComponentProps<'button'> {
  /**
   * Optional custom caption inside canvas (defaults to false to avoid duplicating EmptyState titles).
   */
  showCaption?: boolean;
}

const SCENE_CONFIG = {
  BASE_WIDTH: 260,
  BASE_HEIGHT: 240,
  BOX: {
    RADIUS_X: 64,
    RADIUS_Y: 34,
    HEIGHT: 62,
    DEPTH: 46,
    FLAP_LENGTH: 0.52,
    MAX_FLAP_ANGLE: 3.65
  },
  TIMING: {
    CYCLE_DURATION: 7.5,
    BOX_OPEN_START: 0.8,
    BOX_OPEN_END: 2.2,
    FLY_EMERGE_START: 2.2,
    FLY_EMERGE_END: 4.6,
    HOLD_END: 6.8
  },
  LIGHT_COLORS: {
    EXTERIOR_LEFT: '#F1F5F9',
    EXTERIOR_RIGHT: '#D8E1ED',
    INTERIOR_BACK_LEFT: '#B9C6D8',
    INTERIOR_BACK_RIGHT: '#A4B4CC',
    INTERIOR_FLOOR: '#91A2BC',
    FLAP_BACK_LEFT: '#E2E9F3',
    FLAP_BACK_RIGHT: '#CBD6E6',
    FLAP_FRONT_LEFT: '#F1F5F9',
    FLAP_FRONT_RIGHT: '#C6D3E4',
    STROKE_BOX: 'rgba(180, 195, 215, 0.45)',
    STROKE_TRAIL: '#A4B3C8',
    SPARKLE: '#B8C5D8',
    INSECT_BODY: '#59667A',
    INSECT_WING: 'rgba(195, 208, 226, 0.75)',
    SHADOW: 'rgba(226, 232, 240, 0.65)',
    CAPTION: '#94A3B8'
  },
  DARK_COLORS: {
    EXTERIOR_LEFT: '#1E293B',
    EXTERIOR_RIGHT: '#334155',
    INTERIOR_BACK_LEFT: '#475569',
    INTERIOR_BACK_RIGHT: '#64748B',
    INTERIOR_FLOOR: '#334155',
    FLAP_BACK_LEFT: '#334155',
    FLAP_BACK_RIGHT: '#475569',
    FLAP_FRONT_LEFT: '#1E293B',
    FLAP_FRONT_RIGHT: '#334155',
    STROKE_BOX: 'rgba(148, 163, 184, 0.3)',
    STROKE_TRAIL: '#64748B',
    SPARKLE: '#94A3B8',
    INSECT_BODY: '#E2E8F0',
    INSECT_WING: 'rgba(148, 163, 184, 0.6)',
    SHADOW: 'rgba(0, 0, 0, 0.4)',
    CAPTION: '#64748B'
  }
};

type Point = { x: number; y: number };

class IsometricProjector {
  radiusX: number;
  radiusY: number;
  height: number;

  constructor(radiusX: number, radiusY: number, height: number) {
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.height = height;
  }

  project(x: number, y: number, z: number, originX: number, originY: number): Point {
    return {
      x: originX + (x - y) * this.radiusX,
      y: originY + (x + y - 1) * this.radiusY + (1 - z) * this.height
    };
  }
}

class BoxGeometry {
  projector: IsometricProjector;
  flapLength: number;
  maxFlapAngle: number;

  constructor(projector: IsometricProjector, flapLength: number, maxFlapAngle: number) {
    this.projector = projector;
    this.flapLength = flapLength;
    this.maxFlapAngle = maxFlapAngle;
  }

  computeFlapBackLeft(angle: number, cx: number, cy: number) {
    const xOffset = this.flapLength * Math.cos(angle);
    const zOffset = 1 + this.flapLength * Math.sin(angle);
    return [
      this.projector.project(0, 1, 1, cx, cy),
      this.projector.project(0, 0, 1, cx, cy),
      this.projector.project(xOffset, 0, zOffset, cx, cy),
      this.projector.project(xOffset, 1, zOffset, cx, cy)
    ];
  }

  computeFlapBackRight(angle: number, cx: number, cy: number) {
    const yOffset = this.flapLength * Math.cos(angle);
    const zOffset = 1 + this.flapLength * Math.sin(angle);
    return [
      this.projector.project(0, 0, 1, cx, cy),
      this.projector.project(1, 0, 1, cx, cy),
      this.projector.project(1, yOffset, zOffset, cx, cy),
      this.projector.project(0, yOffset, zOffset, cx, cy)
    ];
  }

  computeFlapFrontLeft(angle: number, cx: number, cy: number) {
    const yOffset = 1 - this.flapLength * Math.cos(angle);
    const zOffset = 1 + this.flapLength * Math.sin(angle);
    return [
      this.projector.project(0, 1, 1, cx, cy),
      this.projector.project(1, 1, 1, cx, cy),
      this.projector.project(1, yOffset, zOffset, cx, cy),
      this.projector.project(0, yOffset, zOffset, cx, cy)
    ];
  }

  computeFlapFrontRight(angle: number, cx: number, cy: number) {
    const xOffset = 1 - this.flapLength * Math.cos(angle);
    const zOffset = 1 + this.flapLength * Math.sin(angle);
    return [
      this.projector.project(1, 0, 1, cx, cy),
      this.projector.project(1, 1, 1, cx, cy),
      this.projector.project(xOffset, 1, zOffset, cx, cy),
      this.projector.project(xOffset, 0, zOffset, cx, cy)
    ];
  }

  computeInterior(cx: number, cy: number, depth: number) {
    const zFloor = 1 - depth / SCENE_CONFIG.BOX.HEIGHT;
    return {
      backLeft: [
        this.projector.project(0, 1, 1, cx, cy),
        this.projector.project(0, 0, 1, cx, cy),
        this.projector.project(0, 0, zFloor, cx, cy),
        this.projector.project(0, 1, zFloor, cx, cy)
      ],
      backRight: [
        this.projector.project(0, 0, 1, cx, cy),
        this.projector.project(1, 0, 1, cx, cy),
        this.projector.project(1, 0, zFloor, cx, cy),
        this.projector.project(0, 0, zFloor, cx, cy)
      ],
      floor: [
        this.projector.project(0, 1, zFloor, cx, cy),
        this.projector.project(0, 0, zFloor, cx, cy),
        this.projector.project(1, 0, zFloor, cx, cy),
        this.projector.project(1, 1, zFloor, cx, cy)
      ]
    };
  }

  computeExterior(cx: number, cy: number) {
    return {
      left: [
        this.projector.project(0, 1, 1, cx, cy),
        this.projector.project(1, 1, 1, cx, cy),
        this.projector.project(1, 1, 0, cx, cy),
        this.projector.project(0, 1, 0, cx, cy)
      ],
      right: [
        this.projector.project(1, 1, 1, cx, cy),
        this.projector.project(1, 0, 1, cx, cy),
        this.projector.project(1, 0, 0, cx, cy),
        this.projector.project(1, 1, 0, cx, cy)
      ]
    };
  }
}

class FlightTrajectory {
  sampleCount: number;

  constructor(sampleCount: number) {
    this.sampleCount = sampleCount;
  }

  evaluateCubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const oneMinusT = 1 - t;
    return {
      x:
        Math.pow(oneMinusT, 3) * p0.x +
        3 * Math.pow(oneMinusT, 2) * t * p1.x +
        3 * oneMinusT * Math.pow(t, 2) * p2.x +
        Math.pow(t, 3) * p3.x,
      y:
        Math.pow(oneMinusT, 3) * p0.y +
        3 * Math.pow(oneMinusT, 2) * t * p1.y +
        3 * oneMinusT * Math.pow(t, 2) * p2.y +
        Math.pow(t, 3) * p3.y
    };
  }

  computeSegmentPoint(
    segmentIndex: number,
    u: number,
    cx: number,
    cy: number,
    targetX: number,
    targetY: number
  ): Point {
    const segments: [Point, Point, Point, Point][] = [
      [
        { x: cx, y: cy + 16 },
        { x: cx - 16, y: cy - 10 },
        { x: cx - 30, y: cy - 36 },
        { x: cx - 18, y: cy - 54 }
      ],
      [
        { x: cx - 18, y: cy - 54 },
        { x: cx - 6, y: cy - 70 },
        { x: cx + 20, y: cy - 65 },
        { x: cx + 16, y: cy - 46 }
      ],
      [
        { x: cx + 16, y: cy - 46 },
        { x: cx + 12, y: cy - 30 },
        { x: cx - 10, y: cy - 38 },
        { x: cx - 2, y: cy - 68 }
      ],
      [
        { x: cx - 2, y: cy - 68 },
        { x: cx + 4, y: cy - 88 },
        { x: cx + 12, y: cy - 98 },
        { x: targetX, y: targetY + 6 }
      ]
    ];
    const seg = segments[segmentIndex];
    return this.evaluateCubic(seg[0], seg[1], seg[2], seg[3], u);
  }

  buildPoints(cx: number, cy: number, targetX: number, targetY: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i <= this.sampleCount; i++) {
      const t = i / this.sampleCount;
      const segmentIndex = Math.min(Math.floor(t * 4), 3);
      const u = t * 4 - segmentIndex;
      points.push(this.computeSegmentPoint(segmentIndex, u, cx, cy, targetX, targetY));
    }
    return points;
  }

  getPointAtProgress(points: Point[], progress: number): Point {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const index = Math.min(Math.floor(clampedProgress * (points.length - 1)), points.length - 1);
    return points[index];
  }
}

class SceneRenderer {
  context: CanvasRenderingContext2D;
  colors: typeof SCENE_CONFIG.LIGHT_COLORS;

  constructor(context: CanvasRenderingContext2D, colors: typeof SCENE_CONFIG.LIGHT_COLORS) {
    this.context = context;
    this.colors = colors;
  }

  setColors(colors: typeof SCENE_CONFIG.LIGHT_COLORS) {
    this.colors = colors;
  }

  drawPolygon(points: Point[], fillColor: string) {
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.context.lineTo(points[i].x, points[i].y);
    }
    this.context.closePath();
    this.context.fillStyle = fillColor;
    this.context.fill();
    this.context.strokeStyle = this.colors.STROKE_BOX;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.restore();
  }

  drawGroundShadow(cx: number, cy: number, radiusX: number) {
    this.context.save();
    this.context.beginPath();
    this.context.ellipse(cx, cy + 12, radiusX * 1.1, 14, 0, 0, Math.PI * 2);
    this.context.fillStyle = this.colors.SHADOW;
    this.context.fill();
    this.context.restore();
  }

  drawDottedTrail(points: Point[], progress: number, elapsed: number) {
    if (progress <= 0) return;
    const targetIndex = Math.floor(progress * (points.length - 1));
    this.context.save();
    this.context.beginPath();
    this.context.setLineDash([3, 4]);
    this.context.lineDashOffset = -elapsed * 12;
    this.context.strokeStyle = this.colors.STROKE_TRAIL;
    this.context.lineWidth = 1.4;
    this.context.lineCap = 'round';
    this.context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= targetIndex; i++) {
      this.context.lineTo(points[i].x, points[i].y);
    }
    this.context.stroke();
    this.context.restore();
  }

  drawWing(baseAngle: number) {
    this.context.save();
    this.context.rotate(baseAngle);
    this.context.beginPath();
    this.context.ellipse(-5, -4, 6, 2.5, 0, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  drawInsect(x: number, y: number, elapsed: number, opacity: number) {
    if (opacity <= 0) return;
    this.context.save();
    this.context.globalAlpha = opacity;
    this.context.translate(x, y);
    const wingFlap = Math.sin(elapsed * 26) * 0.25;
    this.context.fillStyle = this.colors.INSECT_WING;
    this.drawWing(-0.8 + wingFlap);
    this.drawWing(0.8 - wingFlap);
    this.context.fillStyle = this.colors.INSECT_BODY;
    this.context.beginPath();
    this.context.ellipse(0, 0, 3.5, 5, 0.1, 0, Math.PI * 2);
    this.context.fill();
    this.context.beginPath();
    this.context.arc(0, -5, 2, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  drawStar(x: number, y: number, outerRadius: number) {
    const innerRadius = outerRadius * 0.26;
    this.context.save();
    this.context.fillStyle = this.colors.SPARKLE;
    this.context.beginPath();
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) this.context.moveTo(px, py);
      else this.context.lineTo(px, py);
    }
    this.context.closePath();
    this.context.fill();
    this.context.restore();
  }

  drawSparkles(cx: number, cy: number, elapsed: number, opacity: number) {
    if (opacity <= 0) return;
    this.context.save();
    this.context.globalAlpha = opacity;
    const pulse = Math.sin(elapsed * 2.5) * 1.5;
    this.drawStar(cx - 74, cy - 48, 6.5 + pulse);
    this.drawStar(cx - 82, cy + 44, 5 + pulse);
    this.drawStar(cx + 84, cy + 46, 7 - pulse);
    this.context.fillStyle = this.colors.SPARKLE;
    const dots = [
      { x: cx - 94, y: cy + 2, r: 2.2 },
      { x: cx - 80, y: cy + 68, r: 1.8 },
      { x: cx + 70, y: cy - 18, r: 2.4 },
      { x: cx + 22, y: cy - 32, r: 1.5 }
    ];
    for (const dot of dots) {
      this.context.beginPath();
      this.context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      this.context.fill();
    }
    this.context.restore();
  }

  drawCaption(cx: number, cy: number) {
    this.context.save();
    this.context.font =
      "500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    this.context.fillStyle = this.colors.CAPTION;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText('Empty box', cx, cy);
    this.context.restore();
  }
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeInOutQuad(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function computeProgress(t: number, start: number, end: number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return (t - start) / (end - start);
}

export function EmptyBoxAnimation({
  showCaption = false,
  className,
  ...props
}: EmptyBoxAnimationProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = React.useRef<number>(performance.now());
  const animFrameRef = React.useRef<number | null>(null);
  const isVisibleRef = React.useRef<boolean>(true);

  const restartAnimation = React.useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const projector = new IsometricProjector(
      SCENE_CONFIG.BOX.RADIUS_X,
      SCENE_CONFIG.BOX.RADIUS_Y,
      SCENE_CONFIG.BOX.HEIGHT
    );
    const boxGeometry = new BoxGeometry(
      projector,
      SCENE_CONFIG.BOX.FLAP_LENGTH,
      SCENE_CONFIG.BOX.MAX_FLAP_ANGLE
    );
    const trajectory = new FlightTrajectory(100);
    const renderer = new SceneRenderer(context, SCENE_CONFIG.LIGHT_COLORS);

    // Coordinate origin within internal reference frame
    const baseW = SCENE_CONFIG.BASE_WIDTH;
    const baseH = SCENE_CONFIG.BASE_HEIGHT;
    const cx = baseW / 2;
    const cy = baseH / 2 + 10;
    const targetX = cx + 18;
    const targetY = cy - 110;

    let isRunning = true;

    const render = (timestamp: number) => {
      if (!isRunning) return;

      if (!isVisibleRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Responsive pixel-perfect scaling
      const physicalW = Math.round(width * dpr);
      const physicalH = Math.round(height * dpr);
      if (canvas.width !== physicalW || canvas.height !== physicalH) {
        canvas.width = physicalW;
        canvas.height = physicalH;
      }

      // Uniform fit without distortion
      const scale = Math.min(width / baseW, height / baseH);
      const offsetX = (width - baseW * scale) / 2;
      const offsetY = (height - baseH * scale) / 2;

      context.setTransform(dpr * scale, 0, 0, dpr * scale, offsetX * dpr, offsetY * dpr);
      context.clearRect(0, 0, baseW, baseH);

      // Theme-aware colors
      const isDark = document.documentElement.classList.contains('dark');
      const colors = isDark ? SCENE_CONFIG.DARK_COLORS : SCENE_CONFIG.LIGHT_COLORS;
      renderer.setColors(colors);

      const elapsed = (timestamp - startTimeRef.current) * 0.001;
      const cycleTime = elapsed % SCENE_CONFIG.TIMING.CYCLE_DURATION;

      // 1. Ground Shadow
      renderer.drawGroundShadow(cx, cy + SCENE_CONFIG.BOX.HEIGHT, SCENE_CONFIG.BOX.RADIUS_X);

      // 2. Box Open Angle
      const openT = easeInOutCubic(
        computeProgress(
          cycleTime,
          SCENE_CONFIG.TIMING.BOX_OPEN_START,
          SCENE_CONFIG.TIMING.BOX_OPEN_END
        )
      );
      const flapAngle = openT * SCENE_CONFIG.BOX.MAX_FLAP_ANGLE;

      // 3. Interior
      const interior = boxGeometry.computeInterior(cx, cy, SCENE_CONFIG.BOX.DEPTH);
      renderer.drawPolygon(interior.backLeft, colors.INTERIOR_BACK_LEFT);
      renderer.drawPolygon(interior.backRight, colors.INTERIOR_BACK_RIGHT);
      renderer.drawPolygon(interior.floor, colors.INTERIOR_FLOOR);

      // 4. Back Flaps
      renderer.drawPolygon(
        boxGeometry.computeFlapBackLeft(flapAngle, cx, cy),
        colors.FLAP_BACK_LEFT
      );
      renderer.drawPolygon(
        boxGeometry.computeFlapBackRight(flapAngle, cx, cy),
        colors.FLAP_BACK_RIGHT
      );

      // 5. Exterior Walls
      const exterior = boxGeometry.computeExterior(cx, cy);
      renderer.drawPolygon(exterior.left, colors.EXTERIOR_LEFT);
      renderer.drawPolygon(exterior.right, colors.EXTERIOR_RIGHT);

      // 6. Front Flaps
      renderer.drawPolygon(
        boxGeometry.computeFlapFrontLeft(flapAngle, cx, cy),
        colors.FLAP_FRONT_LEFT
      );
      renderer.drawPolygon(
        boxGeometry.computeFlapFrontRight(flapAngle, cx, cy),
        colors.FLAP_FRONT_RIGHT
      );

      // 7. Trajectory & Flight
      const flyT = easeInOutQuad(
        computeProgress(
          cycleTime,
          SCENE_CONFIG.TIMING.FLY_EMERGE_START,
          SCENE_CONFIG.TIMING.FLY_EMERGE_END
        )
      );
      const trajectoryPoints = trajectory.buildPoints(cx, cy, targetX, targetY);
      renderer.drawDottedTrail(trajectoryPoints, flyT, elapsed);

      // 8. Insect fluttering
      const flyPos = trajectory.getPointAtProgress(trajectoryPoints, flyT);
      const floatOffset = flyT >= 1 ? Math.sin(elapsed * 1.8) * 3 : 0;
      const insectOpacity = Math.min(
        1,
        computeProgress(
          cycleTime,
          SCENE_CONFIG.TIMING.FLY_EMERGE_START,
          SCENE_CONFIG.TIMING.FLY_EMERGE_START + 0.3
        )
      );
      renderer.drawInsect(flyPos.x, flyPos.y + floatOffset, elapsed, insectOpacity);

      // 9. Sparkles
      const sparkleOpacity = computeProgress(
        cycleTime,
        SCENE_CONFIG.TIMING.FLY_EMERGE_START + 1.2,
        SCENE_CONFIG.TIMING.FLY_EMERGE_END
      );
      renderer.drawSparkles(cx, cy, elapsed, sparkleOpacity);

      if (showCaption) {
        renderer.drawCaption(cx, cy + SCENE_CONFIG.BOX.HEIGHT + 45);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    // Pause when off-screen to conserve GPU/CPU
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    startTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [showCaption]);

  return (
    <button
      type='button'
      aria-label='Ulangi animasi kotak kosong'
      className={cn(
        'relative flex items-center justify-center select-none cursor-pointer appearance-none border-0 bg-transparent p-0',
        className
      )}
      onClick={restartAnimation}
      title='Klik untuk mengulang animasi'
      {...props}
    >
      <canvas ref={canvasRef} aria-hidden='true' className='w-full h-full block' />
    </button>
  );
}
