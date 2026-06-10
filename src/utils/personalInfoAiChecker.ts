export type PersonalInfoSignal =
  | 'birthDate'
  | 'date'
  | 'year'
  | 'phone'
  | 'idNumber'
  | 'name'
  | 'email'
  | 'username'
  | 'address'
  | 'other';

export interface PersonalInfoAiResult {
  hasPersonalInfo: boolean;
  signals: PersonalInfoSignal[];
  explanation: string;
  model: string;
}

export async function checkPersonalInfoWithAi(password: string): Promise<PersonalInfoAiResult> {
  if (!password) {
    return { hasPersonalInfo: false, signals: [], explanation: '', model: '' };
  }

  const response = await fetch('/api/analyze-personal-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error('Personal information AI check failed');
  }

  return response.json();
}
