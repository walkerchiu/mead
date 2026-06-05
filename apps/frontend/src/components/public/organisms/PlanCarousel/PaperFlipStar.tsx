'use client';

import { useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import * as THREE from 'three';

import { portalTokens } from '../../tokens';

/**
 * PaperFlipStar — 展開計畫卡周圍的「紙張翻折」裝飾照片（忠實移植設計師 WebGL
 * prototype 的 shader）。
 *
 * 平常照片以星形小尺寸藏在卡片後方（zIndex 0）；hover 時沿 bezier 弧線往外甩出、
 * 放大約 1.33×、上升、翻折到卡片前方（zIndex 3），帶紙張捲曲、摺痕陰影、背面
 * 灰階與流動高光。照片以 24 角星形 alpha 烤進貼圖，使星形外緣隨紙張一起捲動。
 * flipDir 決定弧線往左或往右甩（背向卡片中心）。尊重 prefers-reduced-motion。
 *
 * WebGL context 在掛載時建立一次並重用；切換計畫（src 改變）時只更換貼圖，
 * 不重建 context，避免自動輪播反覆建立 context 超過瀏覽器上限而遺失。
 */
export interface PaperFlipStarProps {
  /** 照片路徑 */
  src: string;
  /** 星形靜止尺寸（px） */
  size: number;
  /** 相對卡片左上角的位置（px） */
  leftPx: number;
  topPx: number;
  /** 弧線甩出方向：+1 往右、-1 往左（背向卡片中心） */
  flipDir: number;
}

/** 平面分段數 — 越高捲曲越平滑 */
const SEGMENTS = 110;
/** canvas 邊長（px）— 需容納往外甩出的大弧線 */
const CANVAS = 1000;
/** hover 放大倍率（prototype START 297 → END 394 ≈ 1.33） */
const GROW = 1.33;
/** 貼圖解析度（含星形 alpha） */
const TEX_SIZE = 512;

/** 在 2D context 上畫出 24 角鋸齒星形路徑（與舊版 STAR_CLIP 一致） */
function traceStar(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const n = 24;
  ctx.beginPath();
  for (let i = 0; i < n; i += 1) {
    const r = (i % 2 === 0 ? 50 : 45) / 100;
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    const x = (0.5 + r * Math.cos(a)) * w;
    const y = (0.5 + r * Math.sin(a)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** 把照片以星形 alpha 烤進一張方形貼圖（cover 置中） */
function buildStarTexture(img: HTMLImageElement): THREE.CanvasTexture | null {
  const tc = document.createElement('canvas');
  tc.width = TEX_SIZE;
  tc.height = TEX_SIZE;
  const ctx = tc.getContext('2d');
  if (!ctx) return null;
  const ar = img.width / img.height || 1;
  let dw = TEX_SIZE;
  let dh = TEX_SIZE;
  let dx = 0;
  let dy = 0;
  if (ar > 1) {
    dw = TEX_SIZE * ar;
    dx = (TEX_SIZE - dw) / 2;
  } else {
    dh = TEX_SIZE / ar;
    dy = (TEX_SIZE - dh) / 2;
  }
  ctx.save();
  traceStar(ctx, TEX_SIZE, TEX_SIZE);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  const texture = new THREE.CanvasTexture(tc);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** 紙張下方的軟陰影貼圖（徑向漸層橢圓）— 移植自 prototype makeShadowTexture */
function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(256, 128, 10, 256, 128, 230);
  g.addColorStop(0, 'rgba(0,0,0,0.34)');
  g.addColorStop(0.46, 'rgba(0,0,0,0.16)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 三次貝茲（與 vertex shader 的 cubicBezier 一致），供 JS 端算陰影位置 */
function cubicBezier1(a: number, b: number, c: number, d: number, t: number) {
  const inv = 1 - t;
  return (
    inv * inv * inv * a +
    3 * inv * inv * t * b +
    3 * inv * t * t * c +
    t * t * t * d
  );
}

// 忠實移植 prototype script.js 的頂點 shader：bezier 甩弧 + 紙張捲曲 + twist + z。
// 差異：加入 uFlipDir 讓弧線與捲曲方向可左右鏡像（背向卡片中心）。
const VERTEX_SHADER = `
  uniform float uProgress;
  uniform vec2 uStage;
  uniform vec4 uStartRect;
  uniform vec4 uEndRect;
  uniform float uFlipDir;

  varying vec2 vUv;
  varying float vShade;
  varying float vCurl;
  varying float vCrease;
  varying float vBackSide;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  vec2 cubicBezier(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
    float inv = 1.0 - t;
    return inv * inv * inv * a + 3.0 * inv * inv * t * b + 3.0 * inv * t * t * c + t * t * t * d;
  }

  void main() {
    vUv = uv;

    float rawP = clamp(uProgress, 0.0, 1.0);
    float p = ease(rawP);
    float curl = pow(max(sin(rawP * 3.14159265), 0.0), 0.72);
    float activeCurl = curl * smoothstep(0.03, 0.16, rawP) * (1.0 - smoothstep(0.86, 1.0, rawP));

    vec4 rect = mix(uStartRect, uEndRect, p);
    rect.zw += vec2(76.0, 52.0) * activeCurl;

    vec2 startCenter = vec2(uStartRect.x + uStartRect.z * 0.5 - uStage.x * 0.5, uStage.y * 0.5 - uStartRect.y - uStartRect.w * 0.5);
    vec2 endCenter = vec2(uEndRect.x + uEndRect.z * 0.5 - uStage.x * 0.5, uStage.y * 0.5 - uEndRect.y - uEndRect.w * 0.5);
    vec2 c1 = startCenter + vec2(380.0 * uFlipDir, -118.0);
    vec2 c2 = endCenter + vec2(460.0 * uFlipDir, -238.0);
    vec2 baseCenter = cubicBezier(startCenter, c1, c2, endCenter, p);

    float bottomLead = pow(1.0 - uv.y, 1.2);
    float topLag = pow(uv.y, 1.35);
    float localP = clamp(p + activeCurl * (bottomLead * 0.27 - topLag * 0.09), 0.0, 1.0);
    vec2 curlCenter = cubicBezier(startCenter, c1, c2, endCenter, localP);
    vec2 center = mix(baseCenter, curlCenter, activeCurl * 0.96);

    float x = position.x * rect.z;
    float y = (uv.y - 0.5) * rect.w;
    float xNorm = position.x * 2.0;
    float yNorm = uv.y * 2.0 - 1.0;
    float bottom = pow(1.0 - uv.y, 2.25);
    float top = pow(uv.y, 1.8);
    float sEdge = yNorm - 0.42 * yNorm * yNorm * yNorm;
    float foldCenter = mix(0.14, 0.76, smoothstep(0.08, 0.82, rawP));
    float foldDist = uv.y - foldCenter;
    float foldBand = exp(-foldDist * foldDist * 52.0);
    float underside = (1.0 - smoothstep(foldCenter - 0.14, foldCenter + 0.12, uv.y)) * (1.0 - smoothstep(0.68, 0.98, rawP));

    vec2 warped = vec2(x, y);
    warped.x += activeCurl * uFlipDir * (132.0 * sEdge + 124.0 * bottom - 34.0 * top + 28.0 * xNorm * yNorm + 68.0 * foldBand);
    warped.y += activeCurl * (78.0 * bottom + 24.0 * top + 48.0 * foldBand - 42.0 * sin((uv.y * 1.74 + 0.18) * 3.14159265));

    float twist = activeCurl * mix(-0.44, 0.34, smoothstep(0.34, 0.78, rawP)) * uFlipDir;
    float tc = cos(twist);
    float ts = sin(twist);
    warped = mat2(tc, -ts, ts, tc) * warped;
    warped *= 1.0 + activeCurl * (0.06 + foldBand * 0.05);

    float z = mix(-230.0, 132.0, p);
    z += activeCurl * (270.0 * foldBand + 210.0 * bottom - 62.0 * top + 46.0 * xNorm);

    vCurl = activeCurl;
    vCrease = foldBand * activeCurl;
    vBackSide = underside * activeCurl;
    vShade = clamp(0.94 + p * 0.08 + uv.y * 0.07 - activeCurl * (0.08 + bottom * 0.18) - foldBand * activeCurl * 0.2, 0.5, 1.16);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(center + warped.xy, z, 1.0);
  }
`;

// 忠實移植 prototype 的片段 shader：背面灰階、摺痕陰影、流動高光（加 uHasMap 守門）。
const FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  uniform float uProgress;
  uniform float uHasMap;

  varying vec2 vUv;
  varying float vShade;
  varying float vCurl;
  varying float vCrease;
  varying float vBackSide;

  void main() {
    if (uHasMap < 0.5) discard;
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.04) discard;

    vec3 gray = vec3(dot(tex.rgb, vec3(0.299, 0.587, 0.114)));
    vec3 backColor = mix(vec3(0.84), gray, 0.24);
    vec3 faceColor = tex.rgb * vShade;

    float backMix = (gl_FrontFacing ? 0.0 : 1.0) * (1.0 - smoothstep(0.62, 0.95, uProgress));
    backMix = clamp(backMix + vBackSide * 0.72, 0.0, 0.82);
    float sheen = smoothstep(0.0, 0.42, vUv.x + vUv.y + uProgress * 0.62) * (1.0 - smoothstep(0.44, 0.82, vUv.x + vUv.y + uProgress * 0.62));

    vec3 color = mix(faceColor, backColor, backMix);
    color *= 1.0 - vCrease * 0.28;
    color += vec3(0.2) * sheen * vCurl * 0.22;
    color += vec3(0.18) * vCrease * (1.0 - backMix) * 0.18;

    gl_FragColor = vec4(color, tex.a);
  }
`;

interface Gfx {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  draw: () => void;
}

export function PaperFlipStar({
  src,
  size,
  leftPx,
  topPx,
  flipDir,
}: PaperFlipStarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const gfxRef = useRef<Gfx | null>(null);
  const ctrl = useRef<{
    target: number;
    current: number;
    raf: number;
    kick: () => void;
  }>({ target: 0, current: 0, raf: 0, kick: () => {} });

  // canvas 置中對齊星形：rest 照片（size）落在 wrapper（size）的位置
  const offset = Math.round((size - CANVAS) / 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = ctrl.current;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(CANVAS, CANVAS, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -CANVAS / 2,
      CANVAS / 2,
      CANVAS / 2,
      -CANVAS / 2,
      0.1,
      3000,
    );
    camera.position.z = 1000;

    // 本地「stage」= canvas；START 置中（對齊靜止星形），END 放大且略上移。
    const hoverSize = size * GROW;
    const startRect = new THREE.Vector4(
      (CANVAS - size) / 2,
      (CANVAS - size) / 2,
      size,
      size,
    );
    const endRect = new THREE.Vector4(
      (CANVAS - hoverSize) / 2,
      (CANVAS - hoverSize) / 2 - 24,
      hoverSize,
      hoverSize,
    );

    const geometry = new THREE.PlaneGeometry(1, 1, SEGMENTS, SEGMENTS);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: null },
        uHasMap: { value: 0 },
        uProgress: { value: 0 },
        uStage: { value: new THREE.Vector2(CANVAS, CANVAS) },
        uStartRect: { value: startRect },
        uEndRect: { value: endRect },
        uFlipDir: { value: flipDir >= 0 ? 1 : -1 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 紙張下方的軟陰影（移植 prototype shadowMesh）— 隨翻折沿 bezier 移動、放大、變深。
    const dir = flipDir >= 0 ? 1 : -1;
    const shadowTex = makeShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.22,
    });
    const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
    shadowMesh.position.z = -420;
    scene.add(shadowMesh);

    const startCx = startRect.x + startRect.z * 0.5 - CANVAS / 2;
    const startCy = CANVAS / 2 - startRect.y - startRect.w * 0.5;
    const endCx = endRect.x + endRect.z * 0.5 - CANVAS / 2;
    const endCy = CANVAS / 2 - endRect.y - endRect.w * 0.5;
    const c1x = startCx + 380 * dir;
    const c1y = startCy - 118;
    const c2x = endCx + 460 * dir;
    const c2y = endCy - 238;
    const updateShadow = (progress: number) => {
      const p = progress * progress * (3 - 2 * progress);
      const w = startRect.z + (endRect.z - startRect.z) * p;
      const h = startRect.w + (endRect.w - startRect.w) * p;
      const cx = cubicBezier1(startCx, c1x, c2x, endCx, p);
      const cy = cubicBezier1(startCy, c1y, c2y, endCy, p);
      const curl = Math.max(0, Math.sin(progress * Math.PI));
      shadowMesh.position.x = cx + 34 * curl * dir;
      shadowMesh.position.y = cy - h * (0.52 + 0.18 * curl);
      shadowMesh.scale.set(
        w * (0.74 + p * 0.24 + curl * 0.16),
        h * (0.12 + curl * 0.08),
        1,
      );
      shadowMat.opacity = 0.04 + curl * 0.075 + p * 0.025;
    };

    const draw = () => {
      material.uniforms.uProgress.value = state.current;
      updateShadow(state.current);
      renderer.render(scene, camera);
    };
    gfxRef.current = { renderer, scene, camera, material, draw };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = reduced ? 200 : 4.8;
      state.current +=
        (state.target - state.current) * (1 - Math.exp(-speed * dt));
      // z-index 隨翻折進度（非 hover）：progress>0.5 抬到卡前，回到靜止才落後。
      // 這樣離開時紙張會「翻回後」才掉到卡後，不會未翻完就瞬間消失；游標在兩張
      // 照片間快速移動時，兩張也各自依自身進度正確分層。
      if (wrapRef.current) {
        wrapRef.current.style.zIndex = state.current > 0.5 ? '3' : '0';
      }
      if (Math.abs(state.target - state.current) < 0.001) {
        state.current = state.target;
        draw();
        state.raf = 0;
        return;
      }
      draw();
      state.raf = requestAnimationFrame(loop);
    };
    state.kick = () => {
      if (!state.raf) {
        last = performance.now();
        state.raf = requestAnimationFrame(loop);
      }
    };

    draw();

    return () => {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.kick = () => {};
      gfxRef.current = null;
      geometry.dispose();
      const tex = material.uniforms.uMap.value as THREE.Texture | null;
      tex?.dispose();
      material.dispose();
      shadowMesh.geometry.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      // 只 dispose、不 forceContextLoss：StrictMode（dev）會 mount→unmount→mount，
      // forceContextLoss 會永久殺死 canvas context，導致第二次掛載渲染空白。
      renderer.dispose();
    };
  }, [size, flipDir]);

  // 載入 / 更換貼圖（切換計畫時只換貼圖，重用既有 context）
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const gfx = gfxRef.current;
      if (cancelled || !gfx) return;
      const tex = buildStarTexture(img);
      if (!tex) return;
      tex.anisotropy = Math.min(
        gfx.renderer.capabilities.getMaxAnisotropy(),
        8,
      );
      const old = gfx.material.uniforms.uMap.value as THREE.Texture | null;
      gfx.material.uniforms.uMap.value = tex;
      gfx.material.uniforms.uHasMap.value = 1;
      old?.dispose();
      gfx.draw();
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <Box
      ref={wrapRef}
      aria-hidden
      onPointerEnter={() => {
        ctrl.current.target = 1;
        ctrl.current.kick();
      }}
      onPointerLeave={() => {
        ctrl.current.target = 0;
        ctrl.current.kick();
      }}
      sx={{
        display: 'none',
        [portalTokens.mq.tabletUp]: { display: 'block' },
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: size,
        height: size,
        overflow: 'visible',
        // z-index 由 rAF 依翻折進度設定（見 loop）；靜止在卡後、翻折抬到卡前
        zIndex: 0,
        // 依 Figma 裝飾星形（node 1:3/1:4/1:5）opacity 60%：靜止時融入灰底、
        // 照片色調與設計稿一致；hover 翻出特寫時還原全不透明。
        opacity: 0.6,
        transition: 'opacity 0.4s ease',
        '&:hover': { opacity: 1 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: offset,
          top: offset,
          width: CANVAS,
          height: CANVAS,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
