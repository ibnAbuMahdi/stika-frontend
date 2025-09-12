import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const SelectRoot = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Select.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </Select.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(Select);
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <div className="truncate">{children}</div>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value } = React.useContext(Select);
  
  return (
    <span
      ref={ref}
      className={cn("text-left", className)}
      {...props}
    >
      {value || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(Select);
  
  if (!open) return null;
  
  return (
    <div className="relative">
      <div
        className="fixed inset-0 z-10"
        onClick={() => setOpen(false)}
      />
      <div
        ref={ref}
        className={cn(
          "absolute z-20 top-1 left-0 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(Select);
  const isSelected = value === selectedValue;
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none",
        isSelected && "bg-purple-50 text-purple-900",
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <div className="flex items-center">
        {isSelected && <Check className="h-4 w-4 mr-2" />}
        {children}
      </div>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { SelectRoot as Select, SelectTrigger, SelectValue, SelectContent, SelectItem };