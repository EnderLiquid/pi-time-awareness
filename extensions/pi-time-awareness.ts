import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getLastTimeAnchorInjectedAt, shouldInjectTimeAnchor } from "./shared/state.js";
import { buildTimeToolPayload, buildTimestampMessage } from "./shared/time.js";

const EMPTY_TOOL_PARAMS = Type.Object({});

const timeTool = defineTool({
	name: "time",
	label: "Time",
	description: "Get the exact current time in the runtime's local timezone. Use this whenever the precise current moment matters, including when the conversation contains earlier time anchors; do not infer \"now\" from those anchors. Returns a formatted display string and a Unix millisecond timestamp.",
	promptSnippet: "Get the exact current time in the runtime's local timezone and return a display string plus a Unix millisecond timestamp.",
	promptGuidelines: ["The system provides a time anchor about once per hour. Call `time` when you need the exact current time; do not infer \"now\" from historical time anchors."],
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

	pi.on("before_agent_start", (_event, ctx) => {
		const lastInjectedAt = getLastTimeAnchorInjectedAt(ctx.sessionManager.getBranch());
		const now = Date.now();

		if (!shouldInjectTimeAnchor(lastInjectedAt, now)) return;

		return {
			message: buildTimestampMessage(now),
		};
	});
}
