# Pi Time Awareness

English | [简体中文](README.zh-CN.md)

> “What, then, is time? If no one asks me, I know; if I want to explain it to someone who asks, I do not know.”
>
> — Augustine, *Confessions*, Book XI
>
> (*Quid est ergo tempus? Si nemo ex me quaerat, scio; si quaerenti explicare velim, nescio.*)

In a world where time is the fourth dimension, we need to give models just the right sense of time.

## Overview

`pi-time-awareness` gives models awareness of the current time and of how much time has elapsed over the course of a session.

## Install

### npm package

```bash
pi install npm:pi-time-awareness
```

### Git repository

```bash
pi install git:github.com/EnderLiquid/pi-time-awareness
```

## The challenge

How can a model perceive time?

The simplest approach is to put the current time directly into the system prompt. The problem is that changes to the time also change the system prompt, potentially invalidating the prompt cache. History tends to repeat itself:

- A clock refreshed every second in `oh-my-openagent`'s system prompt once cut its cache hit rate in half ([oh-my-openagent#1970](https://github.com/code-yeongyu/oh-my-openagent/issues/1970), [original Linux.do post](https://linux.do/t/topic/1658684)).
- A date change in Pi's system prompt after midnight forced one user running a model locally to spend tens of minutes waiting for re-prefill when resuming a long session across days ([pi#6621](https://github.com/earendil-works/pi/issues/6621)). Pi fixed this in 0.80.7 by [removing the native date hint](https://github.com/earendil-works/pi/commit/f4e9ca7466b5576090d1093c27fe38d73909f3d2).

Moreover, this approach only tells the model the current time; it does not let the model perceive how much time has elapsed during the session.

Another approach is to inject time into every user message. It keeps the system prompt stable for caching and provides a sense of the session's duration, but it can introduce too much noise into the context.

## The solution

`pi-time-awareness` addresses these trade-offs with two complementary time capabilities:

- Low-frequency time anchors: After a new user message, the plugin occasionally injects an extra time hint that is hidden in the TUI but written to the session history. The model can use the latest anchor as an approximate temporal reference, and use multiple anchors throughout the context to understand the session's time span. Anchors are injected at least one hour apart to avoid unnecessary context noise. Throttling is based on the latest time anchor on the current session branch, so it remains correct after rewinding the tree or switching branches.

- The `time` tool: Time anchors are approximate references. Whenever the exact current time is needed, the model can proactively call `time` rather than infer “now” from historical anchors. The tool returns a formatted time string in `display` and a Unix millisecond timestamp in `unixMs`.

This resembles how humans perceive time: we do not stare at a clock continuously; we check it when needed or from time to time.

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

The plugin follows the runtime's local timezone and renders the offset in `UTC±HH:mm` form.

## Dependencies

- Pi >= 0.84.0

## License

MIT License
