import React, { useState } from 'react';
import { Diamond } from '@/types/diamond';
import { Button } from '@/components/ui/button';

interface PremiumStoreFiltersProps {
  diamonds: Diamond[];
  onFilter: (filters: { shape?: string; color?: string; clarity?: string; price?: number }) => void;
}

export function PremiumStoreFilters({ diamonds, onFilter }: PremiumStoreFiltersProps) {
  const [shape, setShape] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [clarity, setClarity] = useState<string>('');
  const [price, setPrice] = useState<number>(0);

  const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShape(e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(e.target.value);
  };

  const handleClarityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClarity(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
  };

  const applyFilters = () => {
    onFilter({
      shape: shape,
      color: color,
      clarity: clarity,
      price: price,
    });
  };

  const resetFilters = () => {
    setShape('');
    setColor('');
    setClarity('');
    setPrice(0);
    onFilter({});
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">Premium Filters</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shape" className="block text-sm font-medium text-gray-700">
            Shape
          </label>
          <select
            id="shape"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={shape}
            onChange={handleShapeChange}
          >
            <option value="">All Shapes</option>
            {[...new Set(diamonds.map((d) => d.shape))].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <select
            id="color"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={color}
            onChange={handleColorChange}
          >
            <option value="">All Colors</option>
            {[...new Set(diamonds.map((d) => d.color))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="clarity" className="block text-sm font-medium text-gray-700">
            Clarity
          </label>
          <select
            id="clarity"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={clarity}
            onChange={handleClarityChange}
          >
            <option value="">All Clarities</option>
            {[...new Set(diamonds.map((d) => d.clarity))].map((cl) => (
              <option key={cl} value={cl}>
                {cl}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Max Price
          </label>
          <input
            type="number"
            id="price"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={price}
            onChange={handlePriceChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}
