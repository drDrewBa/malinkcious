import { Separator } from "@/components/ui/separator";
import {
  EyeOff,
  Github,
  Highlighter,
  MousePointer,
  Pointer,
  LogOut,
  TextCursor,
} from "lucide-react";
import { UseExtensionState } from "../hooks/extension-state";
import { useAuthState } from "../hooks/auth-state";
import Option from "./components/option";
import PageReport from "./components/page-report";
import { Button } from "@/components/ui/button";
import google from "@/assets/google.svg";

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

  const { isAuthenticated, userProfile, isLoading, signIn, signOut } =
    useAuthState();

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

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="w-[480px] bg-zinc-950 text-zinc-50 p-4">
      <div className="p-4 border border-zinc-700 rounded-md">
        <div className="flex flex-col gap-4">
          <Option
            checked={isHighlighterActive}
            onCheckedChange={handleSetIsHighlighterActive}
            option="Highlighter"
            description="Highlight links to check if they are malicious"
            type="switch"
            icon={Highlighter}
          />
          <Option
            checked={isHoverActive}
            onCheckedChange={handleSetIsHoverActive}
            option="Hover"
            description="Hover over links to check if they are malicious"
            type="switch"
            icon={Pointer}
          />
        </div>
        <div className="mt-4" />
        <Separator className="bg-zinc-700 h-px" />
        <div className="mt-4" />
        <div className="flex flex-col gap-4 relative">
          {!isAuthenticated && !isLoading && (
            <div className="absolute top-0 left-0 w-full h-full z-50 bg-zinc-950/10 backdrop-blur-xl rounded-sm flex flex-col items-center justify-center border border-zinc-700">
              <p className="text-xs font-light font-lexend tracking-wider text-zinc-500">
                You need an account to unlock all features.
              </p>
              <div className="mt-6" />
              <Button
                onClick={handleGoogleSignIn}
                className="bg-rose-950/20 rounded-sm font-lexend tracking-wider text-xs font-light py-0 px-8 border border-rose-900 text-rose-500 hover:cursor-pointer hover:bg-rose-950/20 w-64"
              >
                <img src={google} alt="Google" className="w-4 h-4" />
                Sign in with Google
              </Button>
            </div>
          )}
          <Option
            checked={isUnclickableActive}
            onCheckedChange={handleSetIsUnclickableActive}
            option="Unclickable"
            description="Automatically make malicious links unclickable"
            type="switch"
            icon={MousePointer}
          />
          <Option
            checked={isHideLinksActive}
            onCheckedChange={handleSetIsHideLinksActive}
            option="Hide Links"
            description="Remove malicious links from your page"
            type="switch"
            icon={EyeOff}
          />
          <PageReport />
        </div>
      </div>
      <div className="mt-4" />
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h1 className="text-zinc-600 text-center text-sm font-medium tracking-wider cursor-default">
            ma<span className="text-rose-900">l!nk</span>cious
          </h1>
          {/* <div className="py-0 px-2 bg-zinc-800 rounded-xs">
            <p className="text-[10px] font-lexend text-zinc-950 uppercase">
              beta
            </p>
          </div> */}
        </div>
        {isAuthenticated && (
          <Button
            onClick={handleSignOut}
            className="text-rose-900 hover:text-rose-800 font-lexend text-xs font-light bg-transparent hover:bg-transparent cursor-pointer h-4 !px-0"
          >
            Sign out
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default App;
