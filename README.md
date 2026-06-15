# Pi Time Awareness

English | [简体中文](./README.zh-CN.md)

In long sessions, Time is often the first thing to become blurry in context.

A model can read context, but it does not always understand time.

In a world where time is the fourth dimension, we need to give it just the right sense of time.

## Install

### npm package

```bash
pi install npm:pi-time-awareness
```

### Git repository

```bash
pi install git:github.com/EnderLiquid/pi-time-awareness
```

## What it does

`pi-time-awareness` gives your Agent awareness of the current time and the time span of the session it is in.

It gives the Agent two complementary time capabilities:

- Low-frequency time anchors: from time to time, the plugin injects an extra time hint after a new user message. This message is hidden in the TUI, but it is written into the session history. That lets the Agent roughly infer the current time from the latest anchor, and sense the time span of the session through multiple anchors across the context. Time anchors are injected at least one hour apart to avoid adding too much context noise.

- The `time` tool: the model can request the exact current time on demand, returned as a formatted display string `display` and a Unix millisecond timestamp `unixMs`.

At the same time, it removes Pi's built-in `Current date:` line from the system prompt, avoiding low-precision date noise that can become stale in long sessions.

## Features

- Low-frequency time injection that stays lightweight in context and friendly to caching

- Persistent time anchors aligned with user messages, replacing Pi's coarse current-date hint with time awareness that is more precise and more dimensional

- Throttling based on the latest time anchor on the current session branch, so rewinding the tree or switching branches still behaves correctly

## Time formats

Examples:

- Anchor message: `Time anchor: Wed 2026-06-17 10:32:45 UTC+08:00`

- Tool result:

```json
{
  "display": "Wed 2026-06-17 10:32:45 UTC+08:00",
  "unixMs": 1781663565000
}
```

The plugin follows the runtime's local timezone and always renders the offset in `UTC±HH:mm` form.

## License

MIT License
