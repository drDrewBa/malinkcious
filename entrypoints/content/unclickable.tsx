import React from 'react';
import { createRoot } from 'react-dom/client';
import { checkMaliciousLink } from './api';
import StatusTooltip from './components/status-tooltip';
import { sharedStyles } from './styles';
import { createLinkProcessor } from './utils/link-processor';
import { createLinkObserver } from './utils/observer';

interface UnclickableState {
  container: HTMLDivElement | null;
  reactRoot: ReturnType<typeof createRoot> | null;
  processedLinks: number;
  maliciousLinks: number;
  isTooltipVisible: boolean;
}

// Function to update a single link based on model prediction
const updateLink = async (link: HTMLAnchorElement, isActive: boolean) => {
  if (!isActive) {
    // Reset styles if feature is not active
    link.style.pointerEvents = '';
    link.style.cursor = '';
    link.style.opacity = '';
    link.style.textDecoration = '';
    link.title = '';
    return false; // Return false to indicate link was not made unclickable
  }

  try {
    const url = link.href;
    const result = await checkMaliciousLink(url);
    
    const isMalicious = result.classification !== 'benign';
    
    if (isMalicious) {
      link.style.pointerEvents = 'none';
      link.style.cursor = 'not-allowed';
      link.style.opacity = '0.7';
      link.style.textDecoration = 'line-through';
      
      // Add a title to show why it's blocked
      link.title = `This link was blocked because it was classified as ${result.classification} (${(result.confidence * 100).toFixed(1)}% confidence)`;
      return true; // Return true to indicate link was made unclickable
    } else {
      // Reset styles for benign links
      link.style.pointerEvents = '';
      link.style.cursor = '';
      link.style.opacity = '';
      link.style.textDecoration = '';
      link.title = '';
      return false;
    }
  } catch (error) {
    console.error('Error checking link:', error);
    // In case of error, leave the link clickable
    link.style.pointerEvents = '';
    link.style.cursor = '';
    link.style.opacity = '';
    link.style.textDecoration = '';
    return false;
  }
};

const unclickableAction = (link: HTMLAnchorElement, isMalicious: boolean) => {
  if (isMalicious) {
    link.style.pointerEvents = 'none';
    link.style.cursor = 'not-allowed';
    link.style.opacity = '0.7';
    link.style.textDecoration = 'line-through';
  } else {
    link.style.pointerEvents = '';
    link.style.cursor = '';
    link.style.opacity = '';
    link.style.textDecoration = '';
  }
};

export const initUnclickable = () => {
  const { updateAllLinks, createInitialState } = createLinkProcessor({
    featureName: 'made unclickable',
    linkAction: unclickableAction,
    tooltipMessage: 'Links Made Unclickable'
  });
  
  const state = createInitialState();
  let isActive = false;

  // Watch for storage changes
  const storageListener = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.isUnclickableActive) {
      isActive = changes.isUnclickableActive.newValue;
      if (isActive) {
        state.isTooltipVisible = true;
      }
      await updateAllLinks(state, isActive);
      
      if (!isActive) {
        state.processedLinks = 0;
        state.maliciousLinks = 0;
        state.isTooltipVisible = false;
      }
    }
  };

  chrome.storage.onChanged.addListener(storageListener);

  // Check initial state
  chrome.storage.local.get(["isUnclickableActive"]).then(result => {
    isActive = result.isUnclickableActive || false;
    if (isActive) {
      updateAllLinks(state, isActive);
    }
  });

  // Set up observer
  const observer = createLinkObserver(state, isActive, updateLink, 'Links Made Unclickable');

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(storageListener);
    observer.disconnect();
    updateAllLinks(state, false);
    state.reactRoot?.unmount();
    state.container?.remove();
  };
};

const updateStatusTooltip = (
  state: UnclickableState,
  isProcessing: boolean,
  linksProcessed: number
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
      tooltipMessage: 'Links Made Unclickable',
      onClose: () => {
        state.isTooltipVisible = false;
        state.reactRoot?.unmount();
        state.container?.remove();
        state.container = null;
      }
    })
  );
}; 