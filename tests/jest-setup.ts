// Polyfill structuredClone for jsdom test environment (Node 22 has it globally
// but jest-environment-jsdom does not expose it in its sandbox)
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value));
}
