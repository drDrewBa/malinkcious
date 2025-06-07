import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

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
}

const Option = ({
  option,
  description,
  type,
  buttonText,
  checked,
  onCheckedChange,
  premium,
  locked,
}: OptionProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* {premium && (
            locked ? (
              <Lock className="w-4 h-4 text-red-500" />
            ) : (
              <Unlock className="w-4 h-4 text-zinc-500" />
            )
          )} */}
          <h2 className="font-lexend tracking-wide text-base font-light">
            {option}
          </h2>
        </div>
        {type === "switch" ? (
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            // disabled={locked}
            className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-zinc-600 rounded-xs disabled:cursor-default"
          />
        ) : (
          <Button
            // disabled={locked}
            className="w-16 h-6 rounded-none bg-red-500 hover:bg-red-600 uppercase text-xs disabled:bg-zinc-600"
          >
            {buttonText}
          </Button>
        )}
      </div>
      <p className="info">{description}</p>
    </div>
  );
};

export default Option;
