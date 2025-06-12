import { FileScan } from "lucide-react";
import React from "react";

const PageReport = () => {
  const handleClick = async () => {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    // Set the flag to trigger page report in content script
    await chrome.storage.local.set({ isPageReportActive: true });

    // Close the popup
    window.close();
  };

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col gap-2 rounded-sm border border-amber-700 bg-amber-950/10 p-4 relative overflow-clip transition-all duration-300 cursor-pointer hover:bg-amber-950/20"
    >
      <FileScan className="absolute -right-3.5 bottom-0 text-amber-900" height={60} width={60} />
      <div className="flex gap-2 items-center">
        <p className="text-sm font-light font-lexend tracking-wider text-amber-600">
          Scan Page
        </p>
        {/* <div className="py-0.5 px-2 bg-amber-600 rounded-xs">
          <p className="text-xs font-lexend text-amber-950 uppercase">
            beta
          </p>
        </div> */}
      </div>
      <p className="text-xs font-light font-lexend text-amber-800">
        Generates a report of the links on this page. Click to run.
      </p>
    </div>
  );
};

export default PageReport;
