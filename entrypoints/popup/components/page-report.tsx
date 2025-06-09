import { EyeOff, FileScan } from "lucide-react";
import React from "react";

const PageReport = () => {
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-amber-700 bg-amber-950/10 p-4 relative overflow-clip transition-all duration-300 cursor-pointer">
      <FileScan className="absolute -right-3.5 bottom-0 text-amber-700" height={60} width={60} />
      <p className="text-sm font-light font-lexend tracking-wider text-amber-600">
        Scan Page
      </p>
      <p className="text-xs font-light font-lexend text-amber-800">
        Generates a report of the links on this page. Click to run.
      </p>
    </div>
  );
};

export default PageReport;
