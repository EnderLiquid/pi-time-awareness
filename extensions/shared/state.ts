import { TIMESTAMP_CUSTOM_TYPE } from "./time.js";

const INJECTION_INTERVAL_MS = 60 * 60 * 1000;

type SessionEntry = {
	type: string;
	customType?: string;
	timestamp?: string;
};

export function getLastTimeAnchorInjectedAt(entries: SessionEntry[]): number | undefined {
	for (let index = entries.length - 1; index >= 0; index -= 1) {
		const entry = entries[index];
		if (entry.type !== "custom_message" || entry.customType !== TIMESTAMP_CUSTOM_TYPE) continue;
		const injectedAt = parseEntryTimestamp(entry.timestamp);
		if (injectedAt !== undefined) return injectedAt;
	}
	return undefined;
}

export function shouldInjectTimeAnchor(lastInjectedAt: number | undefined, now: number): boolean {
	if (lastInjectedAt === undefined) return true;
	return now - lastInjectedAt >= INJECTION_INTERVAL_MS;
}

function parseEntryTimestamp(timestamp: string | undefined): number | undefined {
	if (!timestamp) return undefined;
	const unixMs = Date.parse(timestamp);
	return Number.isFinite(unixMs) ? unixMs : undefined;
}
