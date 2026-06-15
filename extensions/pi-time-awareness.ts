import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { buildSystemPrompt } from "./shared/prompt.js";
import { getLastTimeAnchorInjectedAt, shouldInjectTimeAnchor } from "./shared/state.js";
import { buildTimeToolPayload, buildTimestampMessage } from "./shared/time.js";

const EMPTY_TOOL_PARAMS = Type.Object({});

const timeTool = defineTool({
	name: "time",
	label: "Time",
	description: "Get the exact current time. Use this when the precise current moment matters.",
	promptSnippet: "Get the exact current time in the runtime's local timezone and return a display string plus a Unix millisecond timestamp.",
	promptGuidelines: ["Call `time` when you need the precise current time. Do not infer \"now\" only from historical time anchors."],
	parameters: EMPTY_TOOL_PARAMS,
	async execute() {
		const payload = buildTimeToolPayload(Date.now());
		return {
			content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
			details: payload,
		};
	},
});

export default function piTimeAwareness(pi: ExtensionAPI): void {
	pi.registerTool(timeTool);

	pi.on("before_agent_start", async (event, ctx) => {
		const systemPrompt = buildSystemPrompt(event.systemPrompt);
		const lastInjectedAt = getLastTimeAnchorInjectedAt(ctx.sessionManager.getBranch());
		const now = Date.now();

		if (!shouldInjectTimeAnchor(lastInjectedAt, now)) {
			return { systemPrompt };
		}

		return {
			systemPrompt,
			message: buildTimestampMessage(now),
		};
	});
}
