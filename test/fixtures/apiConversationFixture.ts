/**
 * Trimmed ChatGPT API response with:
 * - Multiple system nodes (hidden)
 * - User profile context node (hidden, content_type: user_editable_context)
 * - Tool call nodes (content_type: code, recipient: web)
 * - Real user/assistant conversation nodes
 */
export const apiConversationFixture = {
  mapping: {
    "root": {
      id: "root",
      message: null,
      parent: null,
      children: ["sys1"],
    },
    "sys1": {
      id: "sys1",
      message: {
        id: "sys1",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
        metadata: { is_visually_hidden_from_conversation: true },
      },
      parent: "root",
      children: ["sys2"],
    },
    "sys2": {
      id: "sys2",
      message: {
        id: "sys2",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
        metadata: { is_visually_hidden_from_conversation: true },
      },
      parent: "sys1",
      children: ["user-context"],
    },
    "user-context": {
      id: "user-context",
      message: {
        id: "user-context",
        author: { role: "user" },
        content: { content_type: "user_editable_context", user_profile: "Name: Test" },
        metadata: { is_visually_hidden_from_conversation: true, is_user_system_message: true },
      },
      parent: "sys2",
      children: ["sys3"],
    },
    "sys3": {
      id: "sys3",
      message: {
        id: "sys3",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
        metadata: { is_visually_hidden_from_conversation: true },
      },
      parent: "user-context",
      children: ["u1"],
    },
    "u1": {
      id: "u1",
      message: {
        id: "u1",
        author: { role: "user" },
        content: { content_type: "text", parts: ["Is there an equivalent of the icon a5 but with 4 seats?"] },
        metadata: {},
      },
      parent: "sys3",
      children: ["search-sys"],
    },
    "search-sys": {
      id: "search-sys",
      message: {
        id: "search-sys",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
        metadata: { is_visually_hidden_from_conversation: true },
      },
      parent: "u1",
      children: ["search-prompt"],
    },
    "search-prompt": {
      id: "search-prompt",
      message: {
        id: "search-prompt",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
        metadata: { is_visually_hidden_from_conversation: true },
      },
      parent: "search-sys",
      children: ["tool-call"],
    },
    "tool-call": {
      id: "tool-call",
      message: {
        id: "tool-call",
        author: { role: "assistant" },
        content: { content_type: "code", language: "unknown", text: "search(\"icon a5 4 seats\")" },
        metadata: {},
        recipient: "web",
      },
      parent: "search-prompt",
      children: ["a1"],
    },
    "a1": {
      id: "a1",
      message: {
        id: "a1",
        author: { role: "assistant" },
        content: { content_type: "text", parts: ["Short answer: No — not really."] },
        metadata: {},
        recipient: "all",
      },
      parent: "tool-call",
      children: ["u2"],
    },
    "u2": {
      id: "u2",
      message: {
        id: "u2",
        author: { role: "user" },
        content: { content_type: "text", parts: ["What alternatives exist that are cheaper"] },
        metadata: {},
      },
      parent: "a1",
      children: ["search-sys2"],
    },
    "search-sys2": {
      id: "search-sys2",
      message: {
        id: "search-sys2",
        author: { role: "system" },
        content: { content_type: "text", parts: [""] },
        metadata: { is_visually_hidden_from_conversation: true },
      },
      parent: "u2",
      children: ["tool-call2"],
    },
    "tool-call2": {
      id: "tool-call2",
      message: {
        id: "tool-call2",
        author: { role: "assistant" },
        content: { content_type: "code", language: "unknown", text: "search(\"cheaper alternatives\")" },
        metadata: {},
        recipient: "web",
      },
      parent: "search-sys2",
      children: ["a2"],
    },
    "a2": {
      id: "a2",
      message: {
        id: "a2",
        author: { role: "assistant" },
        content: { content_type: "text", parts: ["If your goal is A5 vibe but cheaper..."] },
        metadata: {},
        recipient: "all",
      },
      parent: "tool-call2",
      children: [],
    },
  },
};
