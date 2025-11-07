import { jest } from "@jest/globals";

type CreateFn = (args?: any) => Promise<{
  choices: { message: { content: string } }[];
}>;

const mockCreate = jest.fn<CreateFn>().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify({
          sentiment: 0.9,
          keywords: ["mocked", "response"],
        }),
      },
    },
  ],
});

await jest.unstable_mockModule("../utils/groqClient.js", () => ({
  groq: { chat: { completions: { create: mockCreate } } },
}));
