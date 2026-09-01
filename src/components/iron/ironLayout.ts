/**
 * The iron is a two-row grid that reads like the phone layout: left to right,
 * then the next row. With an odd number of slots the last one has no partner,
 * so it spans both rows (and both columns on narrow screens); three or fewer
 * slots are all full height.
 */
export const tallSlot = (slot: number, total: number) =>
  total <= 3 || (total % 2 === 1 && slot === total - 1);

export const wideSlot = (slot: number, total: number) =>
  total % 2 === 1 && slot === total - 1;

/** the odd slot out sits in the last column so the pairs can read row by row */
export const lastColumnSlot = (slot: number, total: number) =>
  total > 3 && total % 2 === 1 && slot === total - 1;

const COLS_CLASS = [
  "",
  "sm:grid-cols-1",
  "sm:grid-cols-2",
  "sm:grid-cols-3",
  "sm:grid-cols-4",
];

/** column count for the sm+ grid: pairs stack, so half the slots, rounded up */
export const ironColsClass = (total: number) =>
  COLS_CLASS[total <= 3 ? total : Math.ceil(total / 2)];

export const slotIndexes = (total: number) =>
  Array.from({length: total}, (_slot, i) => i);

/** a wider iron earns more of the row; the queue keeps the rest */
export const ironWidthClass = (total: number) =>
  total >= 7 ? "lg:grid-cols-[minmax(0,min(68rem,66%))_minmax(0,1fr)]"
  : total >= 5 ? "lg:grid-cols-[minmax(0,min(58rem,60%))_minmax(0,1fr)]"
  : "lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)]";
