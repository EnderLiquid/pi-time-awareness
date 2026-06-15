const CURRENT_DATE_LINE_PREFIX = "Current date: ";
const SYSTEM_PROMPT_NOTE = "The system provides a time anchor about once per hour. If you need the exact current time, call the `time` tool.";

export function buildSystemPrompt(systemPrompt: string): string {
	return appendSystemPromptNote(removeCurrentDateLine(systemPrompt), SYSTEM_PROMPT_NOTE);
}

function removeCurrentDateLine(systemPrompt: string): string {
	const lines = systemPrompt.split(/\r?\n/);
	return lines.filter((line) => !line.startsWith(CURRENT_DATE_LINE_PREFIX)).join("\n");
}

function appendSystemPromptNote(systemPrompt: string, note: string): string {
	const trimmed = systemPrompt.trimEnd();
	if (!trimmed) return note;
	return `${trimmed}\n\n${note}`;
}
