import React from 'react';
import { createRoot } from 'react-dom/client';
import StatusTooltip from '../components/status-tooltip';
import { sharedStyles } from '../styles';
import { FeatureState } from '../types';

export const updateStatusTooltip = (
  state: FeatureState,
  isProcessing: boolean,
  linksProcessed: number,
  tooltipMessage: string
) => {
  if (!state.isTooltipVisible) {
    return;
  }

  if (!state.container) {
    // Create container if it doesn't exist
    state.container = document.createElement('div');
    state.container.style.position = 'fixed';
    state.container.style.top = '20px';
    state.container.style.left = '20px';
    state.container.style.zIndex = '999999';
    document.body.appendChild(state.container);

    // Create shadow root
    const shadow = state.container.attachShadow({ mode: 'open' });
    
    // Add shared styles
    const style = document.createElement('style');
    style.textContent = sharedStyles;
    
    // Create container for React root
    const container = document.createElement('div');
    
    shadow.appendChild(style);
    shadow.appendChild(container);
    
    state.reactRoot = createRoot(container);
  }

  // Render or update the tooltip
  state.reactRoot?.render(
    React.createElement(StatusTooltip, {
      isProcessing,
      linksProcessed,
      tooltipMessage,
      onClose: () => {
        state.isTooltipVisible = false;
        state.reactRoot?.unmount();
        state.container?.remove();
        state.container = null;
      }
    })
  );
}; 