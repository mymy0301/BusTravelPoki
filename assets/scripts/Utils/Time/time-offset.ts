let TIME_OFFSET = 0;

export function setTimeOffset(ms: number) {
  TIME_OFFSET = ms;
}
export function getTimeOffset() { return TIME_OFFSET; }

const OriginalDate = Date;

function OffsetDate(this: any, ...args: any[]) {
  if (!(this instanceof OffsetDate)) {
    return OriginalDate.apply(this, args);
  }

  if (args.length === 0) {
    return new OriginalDate(OriginalDate.now() + TIME_OFFSET);
  }

  return new OriginalDate(...args);
}

OffsetDate.prototype = OriginalDate.prototype;

// copy toàn bộ static functions (UTC, now, parse, …)
Object.setPrototypeOf(OffsetDate, OriginalDate);

// hoặc:
// Object.assign(OffsetDate, OriginalDate);

(globalThis as any).Date = OffsetDate;
