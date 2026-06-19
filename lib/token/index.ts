// lib/token — token estimation helpers.
//
// Token estimation is used to show the user how many tokens the clipped content
// will consume in an AI context. For the v1 MVP, we use the simple chars/4 heuristic.

/**
 * Estimates the token count of a Markdown string using the chars/4 heuristic (slight overestimate is safer).
 */
export function estimateTokens(md: string): number {
  if (!md) return 0;
  return Math.ceil(md.length / 4);
}
