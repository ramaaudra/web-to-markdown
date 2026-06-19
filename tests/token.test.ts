import { describe, it, expect } from 'vitest';
import { estimateTokens } from '~/lib/token';

describe('estimateTokens', () => {
  it('returns 0 for empty strings', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens(null as any)).toBe(0);
    expect(estimateTokens(undefined as any)).toBe(0);
  });

  it('estimates tokens for short strings correctly (rounds up)', () => {
    // 1 char -> 1 token
    expect(estimateTokens('a')).toBe(1);
    // 2 chars -> 1 token
    expect(estimateTokens('ab')).toBe(1);
    // 3 chars -> 1 token
    expect(estimateTokens('abc')).toBe(1);
    // 4 chars -> 1 token
    expect(estimateTokens('abcd')).toBe(1);
    // 5 chars -> 2 tokens
    expect(estimateTokens('abcde')).toBe(2);
  });

  it('estimates tokens for standard sentence length', () => {
    const text = 'Hello, this is a simple sentence for token testing.';
    // length is 52 chars. 52 / 4 = 13 tokens
    expect(estimateTokens(text)).toBe(13);
  });

  it('estimates tokens for code-heavy strings', () => {
    const code = `
function add(a: number, b: number): number {
  return a + b;
}
`;
    // length is 63 chars. 63 / 4 = 15.75 -> 16 tokens
    expect(estimateTokens(code)).toBe(16);
  });
});
