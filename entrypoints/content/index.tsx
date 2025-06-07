import { initHighlighter } from './highlighter.tsx';
import { initUnclickable } from './unclickable';
import { initHover } from './hover';

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Initialize features
    const cleanupHighlighter = initHighlighter();
    const cleanupUnclickable = initUnclickable();
    const cleanupHover = initHover();

    // Return cleanup function
    return () => {
      cleanupHighlighter();
      cleanupUnclickable();
      cleanupHover();
    };
  },
});
