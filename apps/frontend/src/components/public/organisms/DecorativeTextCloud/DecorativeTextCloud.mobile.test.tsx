import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';

import { render, screen } from '@/test/test-utils';

import { DecorativeTextCloud } from './DecorativeTextCloud';

function mockMobileViewport() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width:833.95px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function mockTabletViewport() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        !query.includes('max-width:833.95px') &&
        !query.includes('min-width:1200px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function mockDesktopViewport() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width:1200px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('DecorativeTextCloud mobile labels', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stacks each shape label as two horizontal rows on mobile', async () => {
    mockMobileViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          { words: [], photos: [], label: ['藝術與設計', '菁英海外培訓計畫'] },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('藝術與設計')).toHaveAttribute('x', '146');
    });

    const mobileLabels = [
      { text: '藝術與設計', x: '146', y: '173' },
      { text: '菁英海外培訓計畫', x: '157', y: '197' },
      { text: '臺灣國際學生', x: '167', y: '444' },
      { text: '創意設計大賽', x: '186', y: '468' },
      { text: '鼓勵學生參加', x: '120', y: '732' },
      { text: '藝術與設計類國際競賽計畫', x: '128', y: '756' },
    ] as const;

    mobileLabels.forEach(({ text, x, y }) => {
      const el = screen.getByText(text);
      expect(el).toHaveAttribute('x', x);
      expect(el).toHaveAttribute('y', y);
      expect(el).toHaveAttribute('text-anchor', 'start');
      expect(el).toHaveAttribute('font-size', '12.58');
      expect(el).toHaveStyle({ writingMode: 'horizontal-tb' });
    });

    [
      ['藝術與設計', '菁英海外培訓計畫'],
      ['臺灣國際學生', '創意設計大賽'],
      ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
    ].forEach(([first, second]) => {
      expect(screen.getByText(first)).not.toHaveAttribute(
        'y',
        screen.getByText(second).getAttribute('y'),
      );
    });
  });

  it('uses Figma desktop coordinates for every vertical shape label line', async () => {
    mockDesktopViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          { words: [], photos: [], label: ['藝術與設計', '菁英海外培訓計畫'] },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('藝術與設計')).toBeInTheDocument();
    });

    const desktopLabels = [
      { text: '藝術與設計', x: '529', y: '228' },
      { text: '菁英海外培訓計畫', x: '497', y: '246' },
      { text: '臺灣國際學生', x: '746.84', y: '261' },
      { text: '創意設計大賽', x: '711.16', y: '248' },
      { text: '鼓勵學生參加', x: '961', y: '218' },
      { text: '藝術與設計類國際競賽計畫', x: '933', y: '240' },
    ] as const;

    desktopLabels.forEach(({ text, x, y }) => {
      const el = screen.getByText(text);
      expect(el).toHaveAttribute('x', x);
      expect(el).toHaveAttribute('y', y);
      expect(el).toHaveAttribute('text-anchor', 'start');
      expect(el).toHaveAttribute('dominant-baseline', 'middle');
      expect(el).toHaveStyle({ writingMode: 'vertical-rl' });
    });

    [
      ['藝術與設計', '菁英海外培訓計畫'],
      ['臺灣國際學生', '創意設計大賽'],
      ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
    ].forEach(([first, second]) => {
      expect(screen.getByText(first)).not.toHaveAttribute(
        'y',
        screen.getByText(second).getAttribute('y'),
      );
    });
  });

  it('moves the mobile brand labels beside the first shape', async () => {
    mockMobileViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          { words: [], photos: [], label: ['藝術與設計', '菁英海外培訓計畫'] },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mobile-hero-brand-left')).toHaveStyle({
        top: '36px',
        left: '26px',
      });
    });

    expect(screen.getByTestId('mobile-hero-brand-left')).toHaveStyle({
      writingMode: 'vertical-rl',
    });
    expect(screen.getByTestId('mobile-hero-brand-right')).toHaveStyle({
      top: '42px',
      right: '24px',
      writingMode: 'vertical-rl',
    });
    expect(screen.getByText('ART x DESIGN')).toHaveStyle({
      writingMode: 'vertical-rl',
    });
    expect(screen.getByText('臺灣的創造力')).toHaveStyle({
      writingMode: 'vertical-rl',
    });
  });

  it('keeps the mobile gateway nameplate in two columns above Taiwan', async () => {
    mockMobileViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          { words: [], photos: [], label: ['藝術與設計', '菁英海外培訓計畫'] },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('ART x DESIGN')).toBeInTheDocument();
    });

    expect(screen.getByTestId('mobile-hero-title-lockup')).toHaveStyle({
      flexDirection: 'row-reverse',
      writingMode: 'horizontal-tb',
    });
    expect(screen.getByTestId('mobile-hero-taiwan')).toHaveStyle({
      top: '170px',
    });
  });

  it('keeps the first mobile shape visible and places right slogans like the design', async () => {
    mockMobileViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          { words: [], photos: [], label: ['藝術與設計', '菁英海外培訓計畫'] },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('藝術與設計')).toBeInTheDocument();
    });

    const firstShape = document.querySelector('clipPath polygon');
    const points = firstShape?.getAttribute('points') ?? '';
    const minY = Math.min(
      ...points.split(' ').map((point) => Number(point.split(',')[1])),
    );

    expect(minY).toBeGreaterThanOrEqual(0);
    expect(screen.getByText('臺灣的創造力')).toHaveStyle({ top: '0px' });
    expect(screen.getByText('走向世界')).toHaveStyle({ top: '160px' });
  });

  it('starts decorative words below the first shape on mobile', async () => {
    mockMobileViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          {
            words: [
              { zh: '轉化', en: 'transform' },
              { zh: '聽見', en: 'listen' },
              { zh: '生生', en: 'life' },
            ],
            photos: [],
            label: ['藝術與設計', '菁英海外培訓計畫'],
          },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('轉化')).toBeInTheDocument();
    });

    const tops = ['轉化', '聽見', '生生'].map((word) => {
      const el = screen.getByText(word);
      expect(el).toHaveStyle({ color: '#A6A6A6' });
      return Number.parseFloat(window.getComputedStyle(el).top);
    });

    expect(Math.min(...tops)).toBeGreaterThanOrEqual(66);
    expect(Math.max(...tops)).toBeGreaterThanOrEqual(90);
  });

  it('uses tablet-specific brand placement and vertical shape labels', async () => {
    mockTabletViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          {
            words: [
              { zh: '轉化', en: 'transform' },
              { zh: '聽見', en: 'listen' },
              { zh: '生生', en: 'life' },
            ],
            photos: [],
            label: ['藝術與設計', '菁英海外培訓計畫'],
          },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('tablet-hero-brand-left')).toBeInTheDocument();
    });

    expect(screen.getByTestId('tablet-hero-brand-left')).toHaveStyle({
      top: '170px',
      left: '5.5%',
    });
    expect(screen.getByTestId('tablet-hero-brand-right')).toHaveStyle({
      top: '178px',
      right: '6%',
    });
    expect(screen.getByText('臺灣的創造力')).toHaveStyle({
      alignSelf: 'flex-end',
    });
    expect(screen.getByText('藝術與設計')).toHaveAttribute(
      'font-size',
      '12.58',
    );
    expect(screen.getByText('藝術與設計')).toHaveStyle({
      writingMode: 'vertical-rl',
    });

    const tabletLabels = [
      { text: '藝術與設計', x: '429.5', y: '159' },
      { text: '菁英海外培訓計畫', x: '398.5', y: '168' },
      { text: '臺灣國際學生', x: '426', y: '564' },
      { text: '創意設計大賽', x: '402', y: '559' },
      { text: '鼓勵學生參加', x: '427', y: '900' },
      { text: '藝術與設計類國際競賽計畫', x: '401', y: '918' },
    ] as const;

    tabletLabels.forEach(({ text, x, y }) => {
      const el = screen.getByText(text);
      expect(el).toHaveAttribute('x', x);
      expect(el).toHaveAttribute('y', y);
      expect(el).toHaveAttribute('text-anchor', 'start');
    });

    [
      ['藝術與設計', '菁英海外培訓計畫'],
      ['臺灣國際學生', '創意設計大賽'],
      ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
    ].forEach(([first, second]) => {
      expect(screen.getByText(first)).not.toHaveAttribute(
        'y',
        screen.getByText(second).getAttribute('y'),
      );
    });

    const tops = ['轉化', '聽見', '生生'].map((word) => {
      const el = screen.getByText(word);
      return Number.parseFloat(window.getComputedStyle(el).top);
    });

    expect(Math.min(...tops)).toBeGreaterThanOrEqual(48);
  });

  it('right-aligns the desktop creativity slogan', async () => {
    mockDesktopViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          { words: [], photos: [], label: ['藝術與設計', '菁英海外培訓計畫'] },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('臺灣的創造力')).toBeInTheDocument();
    });

    expect(screen.getByText('臺灣的創造力')).toHaveStyle({
      alignSelf: 'flex-end',
    });
    expect(screen.getByText('走向世界')).toHaveStyle({
      alignSelf: 'flex-end',
      marginTop: '12px',
    });
  });

  it('waits after fading out old plan words before fading in the new layer', async () => {
    mockDesktopViewport();

    const shapeContents = [
      {
        words: [{ zh: '轉化', en: 'transform' }],
        photos: [],
        label: ['藝術與設計', '菁英海外培訓計畫'],
      },
      {
        words: [{ zh: '創作', en: 'create' }],
        photos: [],
        label: ['臺灣國際學生', '創意設計大賽'],
      },
      {
        words: [
          { zh: '競賽', en: 'compete' },
          { zh: '延續', en: 'continue' },
        ],
        photos: [],
        label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
      },
    ];

    const { rerender } = render(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('轉化')).toBeInTheDocument();
    });

    vi.useFakeTimers();

    rerender(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={2}
        language="zh"
      />,
    );

    expect(screen.getByText('競賽')).toBeInTheDocument();

    expect(screen.getByText('轉化')).toBeInTheDocument();
    const injectedCss = (document.head.textContent ?? '').replace(/\s|;/g, '');
    expect(injectedCss).toContain(
      'portalPlanWordsFadeOut{from{opacity:1}to{opacity:0}}',
    );
    expect(injectedCss).toContain(
      'portalPlanWordsFadeIn{from{opacity:0}to{opacity:1}}',
    );
    expect(screen.getByText('轉化').parentElement).toHaveStyle({
      animationName: 'portalPlanWordsFadeOut',
      pointerEvents: 'none',
    });
    expect(screen.getByText('轉化')).toHaveStyle({
      animationName: 'none',
    });
    expect(screen.getByText('競賽').parentElement).toHaveStyle({
      animationName: 'portalPlanWordsFadeIn',
      animationDelay: '520ms',
    });

    act(() => {
      vi.advanceTimersByTime(519);
    });

    expect(screen.getByText('轉化')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.queryByText('轉化')).not.toBeInTheDocument();
    expect(screen.getByText('競賽')).toBeInTheDocument();
  });

  it('shows every first-plan decorative word at initial load', async () => {
    mockDesktopViewport();

    render(
      <DecorativeTextCloud
        shapeContents={[
          {
            words: [
              { zh: '轉化', en: 'transform' },
              { zh: '聽見', en: 'listen' },
              { zh: '生生', en: 'life' },
            ],
            photos: [],
            label: ['藝術與設計', '菁英海外培訓計畫'],
          },
          { words: [], photos: [], label: ['臺灣國際學生', '創意設計大賽'] },
          {
            words: [],
            photos: [],
            label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
          },
        ]}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('轉化')).toBeInTheDocument();
    });

    const words = ['轉化', '聽見', '生生'].map((text) =>
      screen.getByText(text),
    );
    const durations = words.map(
      (word) => word.style.animationDuration.split(',')[0]?.trim() ?? '',
    );
    const delays = words.map(
      (word) => word.style.animationDelay.split(',')[0]?.trim() ?? '',
    );
    const animationNames = words.map((word) =>
      window.getComputedStyle(word).animationName.split(',')[0]?.trim(),
    );

    durations.forEach((duration, index) => {
      const durationSeconds = Number.parseFloat(duration);
      const delaySeconds = Math.abs(Number.parseFloat(delays[index]));
      expect(delaySeconds / durationSeconds).toBeGreaterThanOrEqual(0.29);
      expect(delaySeconds / durationSeconds).toBeLessThanOrEqual(0.43);
    });
    expect(new Set(animationNames).size).toBeGreaterThan(1);
  });

  it('randomizes decorative word breathing while keeping enough words visible after plan changes', async () => {
    mockDesktopViewport();

    const shapeContents = [
      {
        words: [{ zh: '起點', en: 'start' }],
        photos: [],
        label: ['藝術與設計', '菁英海外培訓計畫'],
      },
      {
        words: [
          { zh: '轉化', en: 'transform' },
          { zh: '聽見', en: 'listen' },
          { zh: '生生', en: 'life' },
        ],
        photos: [],
        label: ['臺灣國際學生', '創意設計大賽'],
      },
      {
        words: [],
        photos: [],
        label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
      },
    ];

    const { rerender } = render(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('起點')).toBeInTheDocument();
    });

    rerender(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={1}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('轉化')).toBeInTheDocument();
    });

    const words = ['轉化', '聽見', '生生'].map((text) =>
      screen.getByText(text),
    );
    const durations = words.map(
      (word) => word.style.animationDuration.split(',')[0]?.trim() ?? '',
    );
    const delays = words.map(
      (word) => word.style.animationDelay.split(',')[0]?.trim() ?? '',
    );
    const minOpacities = words.map((word) =>
      word.style.getPropertyValue('--word-min-opacity'),
    );
    const maxOpacities = words.map((word) =>
      word.style.getPropertyValue('--word-max-opacity'),
    );
    const animationNames = words.map((word) =>
      window.getComputedStyle(word).animationName.split(',')[0]?.trim(),
    );

    expect(new Set(durations).size).toBeGreaterThan(1);
    expect(new Set(delays).size).toBeGreaterThan(1);
    expect(new Set(animationNames).size).toBeGreaterThan(1);
    expect(durations).not.toEqual(['10.80s', '10.80s', '10.80s']);
    expect(delays).not.toEqual(['0.00s', '-3.60s', '-7.20s']);
    durations.forEach((duration) => {
      expect(Number.parseFloat(duration)).toBeGreaterThanOrEqual(18);
      expect(Number.parseFloat(duration)).toBeLessThanOrEqual(30);
    });
    delays.forEach((delay, index) => {
      const delaySeconds = Number.parseFloat(delay);
      const durationSeconds = Number.parseFloat(durations[index]);
      const phaseRatio = Math.abs(delaySeconds) / durationSeconds;
      expect(delaySeconds).toBeLessThanOrEqual(0);
      expect(Math.abs(delaySeconds)).toBeLessThan(durationSeconds);
      expect(phaseRatio).toBeGreaterThanOrEqual(0.14);
      expect(phaseRatio).toBeLessThanOrEqual(0.7);
    });
    expect(new Set(maxOpacities).size).toBeGreaterThan(1);
    minOpacities.forEach((opacity) => {
      expect(Number(opacity)).toBe(0);
    });
    maxOpacities.forEach((opacity) => {
      expect(Number(opacity)).toBeLessThanOrEqual(0.6);
    });

    const injectedCss = (document.head.textContent ?? '').replace(/\s|;/g, '');
    expect(injectedCss).toContain(
      '0%,10%,100%{opacity:var(--word-min-opacity)}',
    );
    expect(injectedCss).toContain('18%,66%{opacity:var(--word-max-opacity)}');
    expect(injectedCss).toContain('74%{opacity:var(--word-min-opacity)}');
    expect(injectedCss).toContain(
      '0%,14%,100%{opacity:var(--word-min-opacity)}',
    );
    expect(injectedCss).toContain('24%,70%{opacity:var(--word-max-opacity)}');
    expect(injectedCss).toContain('78%{opacity:var(--word-min-opacity)}');
    expect(injectedCss).toContain(
      '0%,6%,100%{opacity:var(--word-min-opacity)}',
    );
    expect(injectedCss).toContain('14%,62%{opacity:var(--word-max-opacity)}');
    expect(injectedCss).toContain('70%{opacity:var(--word-min-opacity)}');
  });

  it('follows every default plan index when no shape is hovered', async () => {
    mockDesktopViewport();

    const shapeContents = [
      {
        words: [{ zh: '第一組文字', en: 'first' }],
        photos: [],
        label: ['藝術與設計', '菁英海外培訓計畫'],
      },
      {
        words: [{ zh: '第二組文字', en: 'second' }],
        photos: [],
        label: ['臺灣國際學生', '創意設計大賽'],
      },
      {
        words: [{ zh: '第三組文字', en: 'third' }],
        photos: [],
        label: ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
      },
    ];

    const { rerender } = render(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={0}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('第一組文字')).toBeInTheDocument();
    });

    rerender(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={1}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('第二組文字')).toBeInTheDocument();
    });

    rerender(
      <DecorativeTextCloud
        shapeContents={shapeContents}
        defaultIndex={2}
        language="zh"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('第三組文字')).toBeInTheDocument();
    });
  });
});
