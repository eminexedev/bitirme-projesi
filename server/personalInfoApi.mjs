import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const allowedSignals = new Set([
  'birthDate',
  'date',
  'year',
  'phone',
  'idNumber',
  'name',
  'email',
  'username',
  'address',
  'other',
]);

const defaultModel = 'gpt-5-nano';
const defaultLocalModel = 'llama3.1:latest';
let envLoaded = false;

function loadEnvFile() {
  if (envLoaded) return;
  envLoaded = true;

  for (const fileName of ['.env.local', '.env']) {
    const envPath = resolve(process.cwd(), fileName);
    if (!existsSync(envPath)) continue;

    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

      const [rawKey, ...rawValueParts] = trimmed.split('=');
      const key = rawKey.trim();
      const value = rawValueParts.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });

    req.on('end', () => resolveBody(body));
    req.on('error', reject);
  });
}

function writeJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string') {
    return data.output_text;
  }

  for (const item of data.output ?? []) {
    if (typeof item.content === 'string') {
      return item.content;
    }

    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') {
        return content.text;
      }
    }
  }

  return '';
}

function normalizeResult(result) {
  const signals = Array.isArray(result.signals)
    ? result.signals.filter((signal) => allowedSignals.has(signal))
    : [];

  return {
    hasPersonalInfo: Boolean(result.hasPersonalInfo) && signals.length > 0,
    signals,
    explanation: typeof result.explanation === 'string' ? result.explanation.slice(0, 240) : '',
    model: process.env.OPENAI_MODEL || defaultModel,
  };
}

function parseJsonFromModel(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON');
    return JSON.parse(match[0]);
  }
}

async function analyzePassword(password) {
  loadEnvFile();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return analyzePasswordLocally(password);
  }

  const model = process.env.OPENAI_MODEL || defaultModel;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a password privacy classifier. Check only whether the password contains personal information or personal-information-like patterns. Treat date-like values, birth-date-like numeric strings, years, phone numbers, ID numbers, names, emails, usernames and addresses as personal information risk even without user context. Return JSON only. Do not judge strength, do not suggest a new password.',
        },
        {
          role: 'user',
          content: `Password to classify: ${password}`,
        },
      ],
      max_output_tokens: 160,
      text: {
        format: {
          type: 'json_schema',
          name: 'personal_info_password_check',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              hasPersonalInfo: {
                type: 'boolean',
              },
              signals: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['birthDate', 'date', 'year', 'phone', 'idNumber', 'name', 'email', 'username', 'address', 'other'],
                },
              },
              explanation: {
                type: 'string',
              },
            },
            required: ['hasPersonalInfo', 'signals', 'explanation'],
          },
        },
      },
    }),
  });

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const detail = (data.error?.message ?? responseText.slice(0, 240)) || 'OpenAI API request failed';

    if (response.status === 429) {
      return analyzePasswordLocally(password);
    }

    return {
      statusCode: response.status,
      body: {
        error: 'openai_api_error',
        detail,
      },
    };
  }

  const outputText = extractOutputText(data);
  if (!outputText) {
    return analyzePasswordLocally(password);
  }

  return {
    statusCode: 200,
    body: normalizeResult(parseJsonFromModel(outputText)),
  };
}

async function analyzePasswordLocally(password) {
  const model = process.env.OLLAMA_MODEL || defaultLocalModel;
  let response;

  try {
    response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        prompt: [
          'You are a password privacy classifier.',
          'Check only whether the password contains personal information or personal-information-like patterns.',
          'Treat date-like values, birth-date-like numeric strings, years, phone numbers, ID numbers, names, emails, usernames and addresses as personal information risk even without user context.',
          'Return JSON only with this shape:',
          '{"hasPersonalInfo": boolean, "signals": string[], "explanation": string}',
          'Allowed signals: birthDate, date, year, phone, idNumber, name, email, username, address, other.',
          'Example: Test01012000! contains a DDMMYYYY-like birth date and should return hasPersonalInfo true with birthDate, date and year signals.',
          `Password to classify: ${password}`,
        ].join('\n'),
      }),
    });
  } catch {
    return {
      statusCode: 503,
      body: { error: 'local_ai_unavailable' },
    };
  }

  if (!response.ok) {
    return {
      statusCode: 503,
      body: { error: 'local_ai_unavailable' },
    };
  }

  const data = await response.json();
  const result = normalizeResult(parseJsonFromModel(data.response ?? ''));
  return {
    statusCode: 200,
    body: {
      ...result,
      model,
    },
  };
}

export async function personalInfoApiHandler(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname !== '/api/analyze-personal-info') {
    return false;
  }

  if (req.method !== 'POST') {
    writeJson(res, 405, { error: 'method_not_allowed' });
    return true;
  }

  try {
    const payload = JSON.parse(await readBody(req));
    const password = typeof payload.password === 'string' ? payload.password : '';
    if (!password) {
      writeJson(res, 400, { error: 'password_required' });
      return true;
    }

    const result = await analyzePassword(password);
    writeJson(res, result.statusCode, result.body);
  } catch (error) {
    writeJson(res, 500, { error: 'personal_info_check_failed' });
    console.error(error);
  }

  return true;
}
