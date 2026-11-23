import { describe, expect, it } from 'vitest';
import { STICKER_DIAMETER_MM, stickerGrid, stickerShortName } from './stickerPdf';

describe('round sticker', () => {
  it('is a 50 mm circle and fits several on A4', () => {
    expect(STICKER_DIAMETER_MM).toBe(50);
    const grid = stickerGrid();
    expect(grid.cols).toBeGreaterThanOrEqual(3);
    expect(grid.rows).toBeGreaterThanOrEqual(4);
    const usedWidth = grid.margin * 2 + grid.cols * STICKER_DIAMETER_MM + (grid.cols - 1) * grid.gap;
    const usedHeight = grid.header + grid.rows * STICKER_DIAMETER_MM + (grid.rows - 1) * grid.gap;
    expect(usedWidth).toBeLessThanOrEqual(210);
    expect(usedHeight).toBeLessThanOrEqual(297);
  });

  it('prints the first name and last initial', () => {
    expect(stickerShortName('Raj', 'Kumar')).toBe('Raj K.');
    expect(stickerShortName('Ng', 'Wei Ming')).toBe('Ng W.');
  });
});
