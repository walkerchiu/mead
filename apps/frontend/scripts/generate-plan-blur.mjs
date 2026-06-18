// 生成 SPOSAD 入口網三計畫「裝飾星形」用的預模糊照片（photo_0X.blur.jpg）。
//
// 桌機環狀輪播的裝飾星形以「預先模糊好的圖檔」呈現靜止霧化（見 PlanCarousel 的
// plan-star-haze）：圖檔本身即最終霧化樣貌，繪製第一幀就到位，不會有 CSS filter
// 首幀光柵化造成的「先清晰再變霧」。此腳本即該圖檔的唯一產生來源——調整霧化外觀
// 改這裡並重跑，勿手改二進位檔。
//
// 外觀參數：以原圖縮到 600 寬、Gaussian blur sigma 10 鋪底，再降彩度、提亮，讓
// 霧化輕透、不濃深、保留可辨識的輪廓（彩度約 0.6、亮度約 1.15）。
//
// 執行：pnpm --filter @mead/frontend assets:plan-blur

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_ROOT = path.join(here, '..', 'public', 'images', 'plans');

/** 各計畫資料夾；每個取 photo_01..03 作為三顆裝飾星形的底圖。 */
const PLAN_DIRS = ['01_sposad', '02_tisdc', '03_idc'];
const PHOTO_NAMES = ['photo_01', 'photo_02', 'photo_03'];

/** 霧化外觀：縮圖寬度、模糊強度、彩度 / 亮度倍率。 */
const WIDTH = 600;
const BLUR_SIGMA = 10;
const SATURATION = 0.6;
const BRIGHTNESS = 1.15;

async function generate() {
  for (const dir of PLAN_DIRS) {
    for (const name of PHOTO_NAMES) {
      const src = path.join(PHOTOS_ROOT, dir, 'photos', `${name}.jpg`);
      const out = path.join(PHOTOS_ROOT, dir, 'photos', `${name}.blur.jpg`);
      await sharp(src)
        .resize(WIDTH)
        .blur(BLUR_SIGMA)
        .modulate({ saturation: SATURATION, brightness: BRIGHTNESS })
        .jpeg({ quality: 82 })
        .toFile(out);
      console.log(`✓ ${dir}/photos/${name}.blur.jpg`);
    }
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
