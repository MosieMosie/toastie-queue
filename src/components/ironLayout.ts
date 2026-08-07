/**
 * The iron body is two rows deep on desktop (two columns wide on phones) and
 * fills column by column; the last slot of an odd count doubles up so there
 * is never an empty corner.
 */

export const tallSlot = (slot: number, total: number) =>
  total <= 3 || (total % 2 === 1 && slot === total - 1);

export const wideSlot = (slot: number, total: number) =>
  total % 2 === 1 && slot === total - 1;

export const ironWidthClass = (total: number) =>
  total >= 7 ? "lg:grid-cols-[minmax(0,min(68rem,66%))_minmax(0,1fr)]"
  : total >= 5 ? "lg:grid-cols-[minmax(0,min(58rem,60%))_minmax(0,1fr)]"
  : "lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)]";
