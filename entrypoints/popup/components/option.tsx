import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Highlighter, Lock, MousePointer, TextCursor, Unlock, LucideIcon } from "lucide-react";

interface OptionProps {
  option: string;
  description: string;
  type: "switch" | "button";
  buttonText?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  premium?: boolean;
  locked?: boolean;
  icon?: LucideIcon;
  iconSize?: number;
}

const Option = ({
  option,
  description,
  type,
  checked,
  onCheckedChange,
  icon: Icon,
  iconSize = 60,
}: OptionProps) => {
  return (
    <div 
      className={`flex flex-col gap-2 rounded-sm border p-4 relative overflow-clip transition-all duration-300 cursor-pointer 
        ${checked ? "bg-rose-950/10 border-rose-900 hover:bg-rose-950/20" : "bg-zinc-900/10 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-950" }`}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {Icon && <Icon className={`absolute -right-3.5 bottom-0 ${checked ? "text-rose-950" : "text-zinc-800"}`} height={iconSize} width={iconSize} />}
      <p className={`text-sm font-light font-lexend tracking-wider ${checked ? "text-rose-600" : "text-zinc-500"}`}>{option}</p>
      <p className={`text-xs font-light font-lexend ${checked ? "text-rose-800" : "text-zinc-700"}`}>
        {description}
      </p>
    </div>
  );
};

export default Option;
