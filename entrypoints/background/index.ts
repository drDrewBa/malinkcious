export default defineBackground(() => {
  function main() {
    chrome.runtime.onInstalled.addListener(() => {
      console.log("Hello from background!");
    });
  }

  main();
});
