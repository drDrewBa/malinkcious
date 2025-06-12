import { checkMaliciousLink } from './api';
import { createLinkProcessor } from './utils/link-processor';
import { createLinkObserver } from './utils/observer';

const updateLink = async (link: HTMLAnchorElement, isActive: boolean) => {
  if (!isActive) {
    link.style.display = '';
    return false;
  }

  try {
    const url = link.href;
    const result = await checkMaliciousLink(url);
    const isMalicious = result.classification !== 'benign';
    
    if (isMalicious) {
      link.style.display = 'none';
      return true;
    } else {
      link.style.display = '';
      return false;
    }
  } catch (error) {
    console.error('Error checking link:', error);
    link.style.display = '';
    return false;
  }
};

const hideLinkAction = (link: HTMLAnchorElement, isMalicious: boolean) => {
  if (isMalicious) {
    link.style.display = 'none';
  } else {
    link.style.display = '';
  }
};

export const initHideLinks = () => {
  const { updateAllLinks, createInitialState } = createLinkProcessor({
    featureName: 'hidden',
    linkAction: hideLinkAction,
    tooltipMessage: 'Links Are Hidden'
  });
  
  const state = createInitialState();
  let isActive = false;

  // Watch for storage changes
  const storageListener = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.isHideLinksActive) {
      isActive = changes.isHideLinksActive.newValue;
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
  chrome.storage.local.get(["isHideLinksActive"]).then(result => {
    isActive = result.isHideLinksActive || false;
    if (isActive) {
      updateAllLinks(state, isActive);
    }
  });

  // Set up observer
  const observer = createLinkObserver(state, isActive, updateLink, 'Links Are Hidden');

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(storageListener);
    observer.disconnect();
    updateAllLinks(state, false);
    state.reactRoot?.unmount();
    state.container?.remove();
  };
}; 