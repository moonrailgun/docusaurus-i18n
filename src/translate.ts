import OpenAI from 'openai';
import { options } from './config';

export async function translate(content: string, targetLanguage: string) {
  const client = new OpenAI({
    baseURL: options.baseUrl,
    apiKey: options.apiKey,
  });

  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a super translator which can help user to translate input content to ${targetLanguage}, please direct return the translation result, No nonsense.`,
      },
      { role: 'user', content: content },
    ],
    model: options.model,
  });

  return {
    content: chatCompletion.choices[0].message.content ?? '',
    usage: chatCompletion.usage?.total_tokens ?? 0,
  };
}
