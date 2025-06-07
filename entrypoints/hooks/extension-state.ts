import React, { useEffect } from "react";

export const UseExtensionState = () => {
  const [isHighlighterActive, setIsHighlighterActive] = React.useState<boolean>(false);
  const [isUnclickableActive, setIsUnclickableActive] = React.useState<boolean>(false);
  const [isHideLinksActive, setIsHideLinksActive] = React.useState<boolean>(false);
  const [isHoverActive, setIsHoverActive] = React.useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get(["isHighlighterActive", "isHoverActive", "isUnclickableActive", "isHideLinksActive"], (result) => {
      setIsHighlighterActive(result.isHighlighterActive ?? false);
      setIsUnclickableActive(result.isUnclickableActive ?? false);
      setIsHideLinksActive(result.isHideLinksActive ?? false);
      setIsHoverActive(result.isHoverActive ?? false);
    });
  }, []);

  const handleSetIsHighlighterActive = (value: boolean) => {
    setIsHighlighterActive(value);
    chrome.storage.local.set({ isHighlighterActive: value });
  };

  const handleSetIsHoverActive = (value: boolean) => {
    setIsHoverActive(value);
    chrome.storage.local.set({ isHoverActive: value });
  };

  const handleSetIsUnclickableActive = (value: boolean) => {
    setIsUnclickableActive(value);
    chrome.storage.local.set({ isUnclickableActive: value });
  };

  const handleSetIsHideLinksActive = (value: boolean) => {
    setIsHideLinksActive(value);
    chrome.storage.local.set({ isHideLinksActive: value });
  };

  return {
    isHighlighterActive,
    isHoverActive,
    isUnclickableActive,
    isHideLinksActive,
    setIsHighlighterActive: handleSetIsHighlighterActive,
    setIsHoverActive: handleSetIsHoverActive,
    setIsUnclickableActive: handleSetIsUnclickableActive,
    setIsHideLinksActive: handleSetIsHideLinksActive,
  };
};
