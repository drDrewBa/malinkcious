import { FeatureState } from '../types';
import { updateStatusTooltip } from './tooltip';

export const createLinkObserver = (
  state: FeatureState,
  isActive: boolean,
  updateLink: (link: HTMLAnchorElement, isActive: boolean) => Promise<boolean>,
  tooltipMessage: string
) => {
  const observer = new MutationObserver((mutations) => {
    if (!isActive) return;

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
      Promise.all(newLinks.map(link => updateLink(link, isActive)))
        .then(results => {
          state.processedLinks += newLinks.length;
          state.maliciousLinks += results.filter(Boolean).length;
          updateStatusTooltip(state, false, state.maliciousLinks, tooltipMessage);
        });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}; 