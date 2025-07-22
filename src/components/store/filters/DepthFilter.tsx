import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface DepthFilterProps {
  depthRange: [number, number];
  minDepth: number;
  maxDepth: number;
  onDepthRangeChange: (range: [number, number]) => void;
}

export function DepthFilter({ depthRange, minDepth, maxDepth, onDepthRangeChange }: DepthFilterProps) {
  const [localRange, setLocalRange] = useState(depthRange);

  useEffect(() => {
    setLocalRange(depthRange);
  }, [depthRange]);

  const handleRangeChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setLocalRange(newRange);
  };

  const handleRangeCommit = () => {
    onDepthRangeChange(localRange);
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
          min={minDepth}
          max={maxDepth}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{formatPercent(minDepth)}</span>
        <span>{formatPercent(maxDepth)}</span>
      </div>
    </div>
  );
}