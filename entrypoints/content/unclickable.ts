import { checkMaliciousLink } from './api';
import { PredictionResponse } from './types';

// Function to update a single link based on model prediction
const updateLink = async (link: HTMLAnchorElement, isActive: boolean) => {
  if (!isActive) {
    // Reset styles if feature is not active
    link.style.pointerEvents = '';
    link.style.cursor = '';
    link.style.opacity = '';
    link.style.textDecoration = '';
    link.title = '';
    return;
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
    } else {
      // Reset styles for benign links
      link.style.pointerEvents = '';
      link.style.cursor = '';
      link.style.opacity = '';
      link.style.textDecoration = '';
      link.title = '';
    }
  } catch (error) {
    console.error('Error checking link:', error);
    // In case of error, leave the link clickable
    link.style.pointerEvents = '';
    link.style.cursor = '';
    link.style.opacity = '';
    link.style.textDecoration = '';
  }
};

// Function to update all links on the page
const updateAllLinks = async () => {
  const result = await chrome.storage.local.get(["isUnclickableActive"]);
  const allLinks = document.getElementsByTagName('a');
  
  console.log(`Checking ${allLinks.length} links, feature active: ${result.isUnclickableActive}`);
  
  // Process all links in parallel
  const promises = Array.from(allLinks).map(link => updateLink(link, result.isUnclickableActive));
  await Promise.all(promises);
};

export const initUnclickable = () => {
  let isActive = false;

  // Watch for storage changes
  const storageListener = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.isUnclickableActive) {
      isActive = changes.isUnclickableActive.newValue;
      await updateAllLinks();
    }
  };

  chrome.storage.onChanged.addListener(storageListener);

  // Check initial state
  chrome.storage.local.get(["isUnclickableActive"]).then(result => {
    isActive = result.isUnclickableActive || false;
    if (isActive) {
      updateAllLinks();
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
      // Only check the new links
      newLinks.forEach(link => updateLink(link, isActive));
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
  };
}; 