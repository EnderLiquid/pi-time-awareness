const LOCAL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const UTC_OFFSET_FALLBACK = "UTC+00:00";
export const TIMESTAMP_CUSTOM_TYPE = "timestamp";
const TIME_ANCHOR_PREFIX = "Time anchor:";
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
	timeZone: LOCAL_TIME_ZONE,
	weekday: "short",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hour12: false,
});
const UTC_OFFSET_FORMATTER = new Intl.DateTimeFormat("en-US", {
	timeZone: LOCAL_TIME_ZONE,
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
	timeZoneName: "longOffset",
});

export type TimeToolPayload = {
	display: string;
	unixMs: number;
};

export type TimestampMessageDetails = {
	timeZone: string;
	utcOffset: string;
};

export type TimestampMessage = {
	customType: typeof TIMESTAMP_CUSTOM_TYPE;
	content: string;
	display: false;
	details: TimestampMessageDetails;
};

type DateTimeParts = {
	weekday: string;
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
	second: string;
};

export function buildTimeToolPayload(now: number): TimeToolPayload {
	return {
		display: formatPreciseTime(now),
		unixMs: now,
	};
}

export function buildTimestampMessage(now: number): TimestampMessage {
	return {
		customType: TIMESTAMP_CUSTOM_TYPE,
		content: `${TIME_ANCHOR_PREFIX} ${formatPreciseTime(now)}`,
		display: false,
		details: {
			timeZone: LOCAL_TIME_ZONE,
			utcOffset: getUtcOffsetLabel(now),
		},
	};
}

function formatPreciseTime(timestamp: number): string {
	const parts = getDateTimeParts(timestamp);
	return `${parts.weekday} ${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${getUtcOffsetLabel(timestamp)}`;
}

function getDateTimeParts(timestamp: number): DateTimeParts {
	const partMap = new Map<string, string>();
	for (const part of DATE_TIME_FORMATTER.formatToParts(new Date(timestamp))) {
		if (part.type !== "literal") {
			partMap.set(part.type, part.value);
		}
	}
	return {
		weekday: partMap.get("weekday") ?? "Sun",
		year: partMap.get("year") ?? "0000",
		month: partMap.get("month") ?? "00",
		day: partMap.get("day") ?? "00",
		hour: partMap.get("hour") ?? "00",
		minute: partMap.get("minute") ?? "00",
		second: partMap.get("second") ?? "00",
	};
}

function getUtcOffsetLabel(timestamp: number): string {
	const parts = UTC_OFFSET_FORMATTER.formatToParts(new Date(timestamp));
	const rawOffset = parts.find((part) => part.type === "timeZoneName")?.value;
	return normalizeUtcOffsetLabel(rawOffset);
}

function normalizeUtcOffsetLabel(rawOffset: string | undefined): string {
	if (!rawOffset || rawOffset === "GMT" || rawOffset === "UTC") {
		return UTC_OFFSET_FALLBACK;
	}

	const normalized = rawOffset.replace(/^GMT/, "UTC");
	const match = normalized.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/);
	if (!match) return normalized;

	const [, sign, hour, minute = "00"] = match;
	return `UTC${sign}${hour.padStart(2, "0")}:${minute}`;
}
