import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const FilterInput = (props: FilterInputProps) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input {...props} className={cn("pl-10 bg-card/80", props.className)} />
  </div>
);
export default FilterInput;
