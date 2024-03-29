import { APIGatewayProxyHandler } from 'aws-lambda'
import fetch from 'node-fetch'
import queryString from 'query-string'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const OPENAI_CHAT_COMPLETIONS_API = 'https://api.openai.com/v1/chat/completions'
const OPENAI_SECRET = ''

// Model: gpt-3.5-turbo-0613, gpt-3.5-turbo
const OPENAI_MODEL = 'gpt-3.5-turbo-0613'

export const chatCompletions = async (messages: Message[]): Promise<Message | undefined> => {
  const body = JSON.stringify({
    model: OPENAI_MODEL,
    messages,
  })

  const res = await fetch(OPENAI_CHAT_COMPLETIONS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_SECRET}`,
    },
    body,
  })
  const data = await res.json()

  return data.choices[0].message
};

export const hello: APIGatewayProxyHandler = async (event) => {
  const reqBody = queryString.parse(event.body)

  try {
    const res = await chatCompletions([{
      role: 'user',
      content: reqBody.text.toString(),
    }])

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          response_type: 'in_channel',
          text: res.content,
        },
        null,
        2,
      ),
    }
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify(
        {
          response_type: 'in_channel',
          text: err || 'Something is wrong.',
        },
        null,
        2,
      ),
    }
  }
}
