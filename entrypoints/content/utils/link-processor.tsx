import React from 'react';
import { createRoot } from 'react-dom/client';
import { checkMaliciousLink } from '../api';
import { sharedStyles } from '../styles';
import StatusTooltip from '../components/status-tooltip';

export interface LinkProcessorState {
  container: HTMLDivElement | null;
  reactRoot: ReturnType<typeof createRoot> | null;
  processedLinks: number;
  maliciousLinks: number;
  isTooltipVisible: boolean;
}

export type LinkAction = (link: HTMLAnchorElement, isMalicious: boolean) => void;

interface LinkProcessorConfig {
  featureName: string;
  linkAction: LinkAction;
  tooltipMessage: string;
}

export const createLinkProcessor = ({ featureName, linkAction, tooltipMessage }: LinkProcessorConfig) => {
  const updateLink = async (link: HTMLAnchorElement, isActive: boolean) => {
    if (!isActive) {
      linkAction(link, false);
      return false;
    }

    try {
      const url = link.href;
      const result = await checkMaliciousLink(url);
      const isMalicious = result.classification !== 'benign';
      
      linkAction(link, isMalicious);
      
      if (isMalicious) {
        link.title = `This link was ${featureName} because it was classified as ${result.classification} (${(result.confidence * 100).toFixed(1)}% confidence)`;
      } else {
        link.title = '';
      }
      
      return isMalicious;
    } catch (error) {
      console.error('Error checking link:', error);
      linkAction(link, false);
      return false;
    }
  };

  const updateStatusTooltip = (
    state: LinkProcessorState,
    isProcessing: boolean,
    linksProcessed: number
  ) => {
    if (!state.isTooltipVisible) {
      return;
    }

    if (!state.container) {
      state.container = document.createElement('div');
      state.container.style.position = 'fixed';
      state.container.style.top = '20px';
      state.container.style.left = '20px';
      state.container.style.zIndex = '999999';
      document.body.appendChild(state.container);

      const shadow = state.container.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = sharedStyles;
      const container = document.createElement('div');
      
      shadow.appendChild(style);
      shadow.appendChild(container);
      
      state.reactRoot = createRoot(container);
    }

    state.reactRoot?.render(
      <StatusTooltip
        isProcessing={isProcessing}
        linksProcessed={linksProcessed}
        tooltipMessage={tooltipMessage}
        onClose={() => {
          state.isTooltipVisible = false;
          state.reactRoot?.unmount();
          state.container?.remove();
          state.container = null;
        }}
      />
    );
  };

  const updateAllLinks = async (state: LinkProcessorState, isActive: boolean) => {
    const allLinks = document.getElementsByTagName('a');
    console.log(`Checking ${allLinks.length} links, feature active: ${isActive}`);
    
    if (isActive) {
      updateStatusTooltip(state, true, 0);
    }
    
    const results = await Promise.all(
      Array.from(allLinks).map(link => updateLink(link, isActive))
    );
    
    state.processedLinks = allLinks.length;
    state.maliciousLinks = results.filter(Boolean).length;
    
    if (isActive) {
      updateStatusTooltip(state, false, state.maliciousLinks);
    }
  };

  return {
    updateLink,
    updateAllLinks,
    updateStatusTooltip,
    createInitialState: (): LinkProcessorState => ({
      container: null,
      reactRoot: null,
      processedLinks: 0,
      maliciousLinks: 0,
      isTooltipVisible: true
    })
  };
}; 