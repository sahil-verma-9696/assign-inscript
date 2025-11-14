export function getExpirationMs(expiration: string): number {
  switch (expiration) {
    case "1hour":
      return 1 * 60 * 60 * 1000;
    case "1day":
      return 24 * 60 * 60 * 1000;
    case "30days":
      return 30 * 24 * 60 * 60 * 1000;
    case "never":
      return Number.MAX_SAFE_INTEGER;
    default:
      return 0;
  }
}
