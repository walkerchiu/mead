import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

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
      expect(screen.getByText('藝術與設計')).toHaveAttribute('x', '150');
    });

    const labelPairs = [
      ['藝術與設計', '菁英海外培訓計畫'],
      ['臺灣國際學生', '創意設計大賽'],
      ['鼓勵學生參加', '藝術與設計類國際競賽計畫'],
    ] as const;

    labelPairs.forEach(([first, second]) => {
      const firstText = screen.getByText(first);
      const secondText = screen.getByText(second);

      expect(Number(firstText.getAttribute('x'))).toBeLessThan(
        Number(secondText.getAttribute('x')),
      );
      expect(Number(secondText.getAttribute('x'))).toBeLessThan(
        Number(firstText.getAttribute('x')) + 38,
      );
      expect(firstText).toHaveAttribute('text-anchor', 'start');
      expect(secondText).toHaveAttribute('text-anchor', 'start');
      expect(firstText).toHaveAttribute('font-size', '12');
      expect(secondText).toHaveAttribute('font-size', '12');
      expect(firstText).not.toHaveAttribute('y', secondText.getAttribute('y'));
      expect(firstText).toHaveStyle({ writingMode: 'horizontal-tb' });
      expect(secondText).toHaveStyle({ writingMode: 'horizontal-tb' });
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
    expect(screen.getByText('藝術與設計')).toHaveAttribute('font-size', '18');
    expect(screen.getByText('藝術與設計')).toHaveStyle({
      writingMode: 'vertical-rl',
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
});
