/**
 * 三大計畫的標記形狀 — 與 hero 文字雲（DecorativeTextCloud 的 SHAPE_META）、
 * 輪播指示點（CarouselDots）、敘事區圓點互動共用同一套形狀，維持全站視覺一致：
 * 依計畫順序 ① 微鋸齒星形（菁培）② 近圓多邊形（設計戰國策）③ 六邊形（創意設計大賽）。
 * 三計畫共用品牌橘，形狀即各計畫的辨識特徵。
 */
const PLAN_SHAPES = [
  { rotation: 8, sides: 11, innerRatio: 0.89 },
  { rotation: 14, sides: 13, innerRatio: 1 },
  { rotation: 0, sides: 6, innerRatio: 1 },
] as const;

/** 產生單一計畫形狀的 clip-path（百分比座標；正多邊形或鋸齒星形）。 */
function planShapeClip(shape: (typeof PLAN_SHAPES)[number]): string {
  const base = (shape.rotation * Math.PI) / 180 - Math.PI / 2;
  if (shape.innerRatio >= 1) {
    const pts = Array.from({ length: shape.sides }, (_, i) => {
      const a = base + (i / shape.sides) * Math.PI * 2;
      return `${(50 + 50 * Math.cos(a)).toFixed(1)}% ${(50 + 50 * Math.sin(a)).toFixed(1)}%`;
    });
    return `polygon(${pts.join(', ')})`;
  }
  const n = shape.sides * 2;
  const pts = Array.from({ length: n }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 50 * shape.innerRatio;
    const a = base + (i / n) * Math.PI * 2;
    return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`;
  });
  return `polygon(${pts.join(', ')})`;
}

/** 三大計畫的標記形狀 clip-path（依計畫順序 sposad / idc / tisdc）。 */
export const PLAN_SHAPE_CLIPS: readonly string[] =
  PLAN_SHAPES.map(planShapeClip);
