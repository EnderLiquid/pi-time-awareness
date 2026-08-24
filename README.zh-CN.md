# Pi Time Awareness

[English](README.md) | 简体中文

> “那么什么是时间？若无人问我，我便知道；若要我解释，我便不知道了。”  
> —— 奥古斯丁《忏悔录》第十一卷  
> （*Quid est ergo tempus? Si nemo ex me quaerat, scio; si quaerenti explicare velim, nescio.*）

在以时间为第四维度的世界里，我们需要给模型恰到好处的时间感。

## 概述

`pi-time-awareness` 让模型能够感知当前时间，以及会话经历的时间跨度。

## 安装

### npm package

```bash
pi install npm:pi-time-awareness
```

### Git repository

```bash
pi install git:github.com/EnderLiquid/pi-time-awareness
```

## 困境

怎么让模型感知时间？

最简单的办法是直接把时间写进系统提示词。问题在于，时间变化引起的系统提示词变化可能导致缓存失效。历史总是惊人的相似：

- `oh-my-openagent` 系统提示词中每秒刷新的时间，曾导致缓存命中率腰斩（[oh-my-openagent#1970](https://github.com/code-yeongyu/oh-my-openagent/issues/1970)，[Linux.do 原帖](https://linux.do/t/topic/1658684)）；
- Pi 午夜后系统提示词中的日期变更，使得一名用户的端侧部署大模型不得不在恢复跨天的长会话时花上数十分钟重新预填充（[pi#6621](https://github.com/earendil-works/pi/issues/6621)，Pi 在 0.80.7 通过 [移除原生日期提示](https://github.com/earendil-works/pi/commit/f4e9ca7466b5576090d1093c27fe38d73909f3d2) 修复了该问题）。

另外，这种实现方式只能告知模型当前时间，无法让模型感知会话经历的时间跨度。

另一种办法则向每条用户消息注入时间。这种方式同时解决了缓存和时间跨度感知问题，但仍可能向上下文中注入过多噪音。

## 解法

`pi-time-awareness` 通过为 Agent 提供两种互补的时间能力，解决了上述难题：

- 低频时间锚点：插件会适时在新的用户消息后，额外注入一条在 TUI 中隐藏的时间提示消息。这条消息会写入会话历史，使 Agent 能根据最近锚点粗略了解当前时间，并通过上下文中的多个锚点感知会话的时间跨度。时间锚点的注入间隔至少为一小时，以避免产生过多上下文噪音。节流判断基于当前会话分支的最近时间锚点，回退树或切换分支后仍能保持正确行为。

- `time` 工具：时间锚点提供了近似参照，而在需要获取当前精确时间时，模型还可以主动调用 `time` 工具，而非从历史锚点推断“现在”。`time` 工具返回格式化显示时间的字符串 `display` 和 Unix 毫秒时间戳 `unixMs`。

这就像人类感知时间的方式：我们不会一直盯着手表，只在需要时或每隔一段时间看一眼。

## 时间格式

示例：

- 锚点消息：`Time anchor: Wed 2026-06-17 10:32:45 UTC+08:00`

- 工具返回：
  
  ```json
  {
    "display": "Wed 2026-06-17 10:32:45 UTC+08:00",
    "unixMs": 1781663565000
  }
  ```

插件会跟随运行时所在的本地时区，统一以 `UTC±HH:mm` 形式展示偏移。

## 依赖

- Pi >= 0.84.0

## 许可证

MIT License
