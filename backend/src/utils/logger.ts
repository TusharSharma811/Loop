/* Simple logger wrapper to centralize logging and enable easy upgrades later */
/* No behavioral changes: same messages go to console with timestamps */

type LogLevel = "info" | "warn" | "error" | "debug";

const format = (level: LogLevel, args: unknown[]) => {
  const ts = new Date().toISOString();
  return [`[${ts}]`, level.toUpperCase() + ":", ...args];
};

export const logger = {
  info: (...args: unknown[]) => console.log(...format("info", args)),
  warn: (...args: unknown[]) => console.warn(...format("warn", args)),
  error: (...args: unknown[]) => console.error(...format("error", args)),
  debug: (...args: unknown[]) => console.debug(...format("debug", args)),
};

export default logger;
