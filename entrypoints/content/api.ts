import { PredictionResponse } from './types';

export const checkMaliciousLink = async (text: string): Promise<PredictionResponse> => {
  console.log('Sending URL to check:', text);
  
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
    throw new Error(errorData.detail || 'Failed to check link');
  }

  const result = await response.json();
  console.log('Received response:', result);
  return result;
}; 