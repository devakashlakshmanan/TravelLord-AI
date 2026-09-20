// NH-766 Wayanad Corridor Segment Sequence (South to North-East)
// Adivaram (Base) -> Lakkidi (Ghat Top) -> Vythiri -> Meppadi -> Kalpetta -> Muthanga
export const CORRIDOR_SEGMENT_ORDER = ['S1', 'S5', 'S3', 'S2', 'S6', 'S4'];

/**
 * Returns all segment IDs along the corridor between the source and destination.
 * Works in both directions (Southbound or Northbound).
 */
export function getSegmentsBetween(sourceId: string, destinationId: string): string[] {
  let idxA = CORRIDOR_SEGMENT_ORDER.indexOf(sourceId);
  let idxB = CORRIDOR_SEGMENT_ORDER.indexOf(destinationId);

  // Fallback if either segment is not found in standard corridor order
  if (idxA === -1) idxA = 0;
  if (idxB === -1) idxB = CORRIDOR_SEGMENT_ORDER.length - 1;

  if (idxA <= idxB) {
    return CORRIDOR_SEGMENT_ORDER.slice(idxA, idxB + 1);
  } else {
    // Reverse route
    return CORRIDOR_SEGMENT_ORDER.slice(idxB, idxA + 1).reverse();
  }
}
