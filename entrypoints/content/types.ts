export interface PredictionResponse {
  classification: "benign" | "defacement" | "phishing" | "malware";
  confidence: number;
  text: string;
}

export interface ClassificationDetails {
  icon: JSX.Element;
  title: string;
  description: string;
} 