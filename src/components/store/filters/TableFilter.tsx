import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface TableFilterProps {
  tableRange: [number, number];
  minTable: number;
  maxTable: number;
  onTableRangeChange: (range: [number, number]) => void;
}

export function TableFilter({ tableRange, minTable, maxTable, onTableRangeChange }: TableFilterProps) {
  const [localRange, setLocalRange] = useState(tableRange);

  useEffect(() => {
    setLocalRange(tableRange);
  }, [tableRange]);

  const handleRangeChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setLocalRange(newRange);
  };

  const handleRangeCommit = () => {
    onTableRangeChange(localRange);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{formatPercent(localRange[0])}</span>
        <span>{formatPercent(localRange[1])}</span>
      </div>
      
      <div className="px-2">
        <Slider
          value={localRange}
          onValueChange={handleRangeChange}
          onValueCommit={handleRangeCommit}
          min={minTable}
          max={maxTable}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{formatPercent(minTable)}</span>
        <span>{formatPercent(maxTable)}</span>
      </div>
    </div>
  );
}