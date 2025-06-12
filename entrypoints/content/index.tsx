import { initHighlighter } from './highlighter';
import { initUnclickable } from './unclickable';
import { initHideLinks } from './hide-links';
import { initHover } from './hover';
import { initPageReport } from './page-report';

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Initialize features
    const cleanupHighlighter = initHighlighter();
    const cleanupUnclickable = initUnclickable();
    const cleanupHideLinks = initHideLinks();
    const cleanupHover = initHover();
    const cleanupPageReport = initPageReport();

    // Return cleanup function
    return () => {
      cleanupHighlighter();
      cleanupUnclickable();
      cleanupHideLinks();
      cleanupHover();
      cleanupPageReport();
    };
  },
});
