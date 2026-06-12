import type { Meta, StoryObj } from '@storybook/nextjs';

import { idcPlan } from '@/mocks/fixtures/plans';

import { PLAN_SHAPE_CLIPS } from '../../planShapes';
import { PortalNarrativeSection } from './PortalNarrativeSection';

/**
 * 計畫敘事區塊：右側直書標題 + 左欄前導段落與主文各段。
 * 收束標記呈現目前 active 計畫的形狀，hover 變形為下一個計畫並可點擊切換。
 */
const meta = {
  title: 'Public Scope/Organisms/PortalNarrativeSection',
  component: PortalNarrativeSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof PortalNarrativeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading: '關於教育部藝術與設計三大計畫',
    intro: idcPlan.intro,
    paragraphs: [
      '透過建立國際培訓機制，培養具備國際視野的設計人才，發展出五大領域的培訓規模。',
      '篩選全球指標性設計競賽、訂定等第與獎勵措施，落實臺灣設計教育與國際實務的接軌。',
    ],
    // 目前 active = 菁培（形狀 0），下一個 = 設計戰國策（形狀 1）
    planMarker: {
      currentShapeClip: PLAN_SHAPE_CLIPS[0],
      nextShapeClip: PLAN_SHAPE_CLIPS[1],
      nextLabel: '設計戰國策',
      onSelectNext: () => {},
    },
  },
};
