import type { Meta, StoryObj } from '@storybook/nextjs';

import { idcPlan } from '@/mocks/fixtures/plans';

import { PortalNarrativeSection } from './PortalNarrativeSection';

/**
 * 計畫敘事區塊：右側直書標題 + 左欄前導段落與主文各段。
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
  },
};
