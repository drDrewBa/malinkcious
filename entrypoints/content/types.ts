import { createRoot } from 'react-dom/client';

export interface PredictionResponse {
  classification: string;
  confidence: number;
}

export interface FeatureState {
  container: HTMLDivElement | null;
  reactRoot: ReturnType<typeof createRoot> | null;
  processedLinks: number;
  maliciousLinks: number;
  isTooltipVisible: boolean;
}

export type LinkAction = (link: HTMLAnchorElement, isMalicious: boolean) => void;

export interface LinkProcessorConfig {
  featureName: string;
  linkAction: LinkAction;
  tooltipMessage: string;
}

export interface ClassificationDetails {
  icon: JSX.Element;
  title: string;
  description: string;
} 