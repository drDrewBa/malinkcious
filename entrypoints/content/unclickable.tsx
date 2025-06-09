import React from 'react';
import { checkMaliciousLink } from './api';
import { PredictionResponse } from './types';
import { createRoot } from 'react-dom/client';
import StatusTooltip from './components/status-tooltip';
import { sharedStyles } from './styles';

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

// Function to update all links on the page
const updateAllLinks = async (state: UnclickableState) => {
  const result = await chrome.storage.local.get(["isUnclickableActive"]);
  const allLinks = document.getElementsByTagName('a');
  
  console.log(`Checking ${allLinks.length} links, feature active: ${result.isUnclickableActive}`);
  
  // Show processing status
  updateStatusTooltip(state, true, 0);
  
  // Process all links in parallel
  const results = await Promise.all(
    Array.from(allLinks).map(link => updateLink(link, result.isUnclickableActive))
  );
  
  // Count malicious links
  state.processedLinks = allLinks.length;
  state.maliciousLinks = results.filter(Boolean).length;
  
  // Update status with results
  updateStatusTooltip(state, false, state.maliciousLinks);
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
      onClose: () => {
        state.isTooltipVisible = false;
        state.reactRoot?.unmount();
        state.container?.remove();
        state.container = null;
      }
    })
  );
};

export const initUnclickable = () => {
  const state: UnclickableState = {
    container: null,
    reactRoot: null,
    processedLinks: 0,
    maliciousLinks: 0,
    isTooltipVisible: true
  };

  let isActive = false;

  // Watch for storage changes
  const storageListener = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.isUnclickableActive) {
      isActive = changes.isUnclickableActive.newValue;
      if (isActive) {
        state.isTooltipVisible = true;
        await updateAllLinks(state);
      } else {
        // Reset all links to clickable state
        await updateAllLinks(state);
        // Then clean up tooltip
        state.reactRoot?.unmount();
        state.container?.remove();
        state.container = null;
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
      updateAllLinks(state);
    }
  });

  // Watch for DOM changes to handle dynamically added links
  const observer = new MutationObserver((mutations) => {
    if (!isActive) return; // Don't process if feature is not active

    const newLinks = mutations.reduce<HTMLAnchorElement[]>((acc, mutation) => {
      const links = Array.from(mutation.addedNodes)
        .filter((node): node is HTMLElement => node instanceof HTMLElement)
        .flatMap(node => {
          if (node.tagName === 'A') {
            return [node as HTMLAnchorElement];
          }
          return Array.from(node.getElementsByTagName('a'));
        });
      return [...acc, ...links];
    }, []);

    if (newLinks.length > 0) {
      console.log(`New links detected in DOM: ${newLinks.length}`);
      // Process new links and update counts
      Promise.all(newLinks.map(link => updateLink(link, isActive)))
        .then(results => {
          state.processedLinks += newLinks.length;
          state.maliciousLinks += results.filter(Boolean).length;
          updateStatusTooltip(state, false, state.maliciousLinks);
        });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(storageListener);
    observer.disconnect();
    // Reset all links to their original state
    const allLinks = document.getElementsByTagName('a');
    Array.from(allLinks).forEach(link => {
      link.style.pointerEvents = '';
      link.style.cursor = '';
      link.style.opacity = '';
      link.style.textDecoration = '';
      link.title = '';
    });
    // Clean up tooltip
    state.reactRoot?.unmount();
    state.container?.remove();
  };
}; 