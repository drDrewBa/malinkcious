import { Separator } from "@/components/ui/separator";
import { UseExtensionState } from "../hooks/extension-state";
import Option from "./components/option";
import { User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function App() {
  const {
    isHighlighterActive,
    isUnclickableActive,
    isHideLinksActive,
    isHoverActive,
    setIsHighlighterActive,
    setIsUnclickableActive,
    setIsHideLinksActive,
    setIsHoverActive,
  } = UseExtensionState();

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

  return (  
    <div className="w-[480px] p-4">
      <div className="flex items-center justify-between">
        <h1>
          ma<span className="text-red-600">l!nk</span>cious
        </h1>
        {/* <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-[1px] border-zinc-600 hover:bg-zinc-900">
              <User width={20} height={20} className="text-zinc-600" strokeWidth={1.5} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-zinc-950 text-zinc-600 rounded-none animate-none">
            <p>You are not logged in</p>
          </TooltipContent>
        </Tooltip> */}
      </div>
      <div className="mt-2" />
      <Separator className="h-0.5 bg-zinc-800" />
      <div className="mt-6" />
      <div className="flex flex-col gap-6">
        <Option
          checked={isHighlighterActive}
          onCheckedChange={handleSetIsHighlighterActive}
          option="Highlighter"
          description="Highlight a link to check if it is malicious"
          type="switch"
        />
        <Option
          checked={isHoverActive}
          onCheckedChange={handleSetIsHoverActive}
          option="Hover"
          description="Hover over a link to see if it is malicious"
          type="switch"
        />
        <Option
          checked={isUnclickableActive}
          onCheckedChange={handleSetIsUnclickableActive}
          option="Unclickable"
          description="Automatically make malicious links unclickable"
          type="switch"
        />
        <Separator className="h-0.5 bg-zinc-800" />
        <Option
          checked={isHideLinksActive}
          onCheckedChange={handleSetIsHideLinksActive}
          option="Hide Links"
          description="Remove malicious links from your page"
          type="switch"
          disabled={false}
          premium={true}
          locked={true}
        />
        <Option
          option="Scan Page"
          description="Generate a list of malicious link from a page"
          type="button"
          buttonText="run"
          disabled={false}
          premium={true}
          locked={true}
        />
        <Option
          option="Flagged Links"
          description="Review your flagged links"
          type="button"
          buttonText="view"
          disabled={false}
          premium={true}
          locked={true}
        />
      </div>
    </div>
  );
}

export default App;
