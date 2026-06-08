/**
 * LLM client for frontend calls to LLM API
 * This is a simple wrapper for calling LLM from the frontend via tRPC
 */

export async function invokeLLM(params: {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
}) {
  // For now, we'll create a simple mock response
  // In production, this would call a tRPC procedure
  return {
    choices: [
      {
        message: {
          content: "LLM 分析功能将在后续阶段实现",
        },
      },
    ],
  };
}
