import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diamond } from '@/types/diamond';

const diamondSchema = z.object({
  shape: z.string().min(1, { message: "Shape is required" }),
  carat: z.number().min(0.1, { message: "Carat must be greater than 0" }),
  color: z.string().min(1, { message: "Color is required" }),
  clarity: z.string().min(1, { message: "Clarity is required" }),
  cut: z.string().optional(),
  polish: z.string().optional(),
  symmetry: z.string().optional(),
  fluorescence: z.string().optional(),
  certificateNumber: z.string().optional(),
  certificateUrl: z.string().optional(),
  price: z.number().min(1, { message: "Price must be greater than 0" }),
  depth: z.number().optional(),
  table: z.number().optional(),
  measurements: z.string().optional(),
  lab: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  comment: z.string().optional(),
  store_visible: z.boolean().default(false),
  picture: z.string().optional(),
  color_type: z.string().optional(),
});

type DiamondFormValues = z.infer<typeof diamondSchema>;

interface DiamondFormProps {
  initialData?: Diamond | null;
  onSubmit: (values: DiamondFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function DiamondForm({ initialData, onSubmit, onCancel, isLoading }: DiamondFormProps) {
  const form = useForm<DiamondFormValues>({
    resolver: zodResolver(diamondSchema),
    defaultValues: {
      shape: initialData?.shape || "",
      carat: initialData?.carat || 0,
      color: initialData?.color || "",
      clarity: initialData?.clarity || "",
      cut: initialData?.cut || "",
      polish: initialData?.polish || "",
      symmetry: initialData?.symmetry || "",
      fluorescence: initialData?.fluorescence || "",
      certificateNumber: initialData?.certificateNumber || "",
      certificateUrl: initialData?.certificateUrl || "",
      price: initialData?.price || 0,
      depth: initialData?.depth || 0,
      table: initialData?.table || 0,
      measurements: initialData?.measurements || "",
      lab: initialData?.lab || "",
      location: initialData?.location || "",
      availability: initialData?.availability || "",
      comment: initialData?.comment || "",
      store_visible: initialData?.store_visible || false,
      picture: initialData?.picture || "",
      color_type: initialData?.color_type || "",
    },
    mode: "onChange",
  });

  const { handleSubmit } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diamond Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shape">Shape</Label>
              <Input id="shape" type="text" {...form.register("shape")} />
              {form.formState.errors.shape && (
                <p className="text-sm text-red-500">{form.formState.errors.shape.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="carat">Carat</Label>
              <Input id="carat" type="number" step="0.01" {...form.register("carat", { valueAsNumber: true })} />
              {form.formState.errors.carat && (
                <p className="text-sm text-red-500">{form.formState.errors.carat.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="text" {...form.register("color")} />
              {form.formState.errors.color && (
                <p className="text-sm text-red-500">{form.formState.errors.color.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="clarity">Clarity</Label>
              <Input id="clarity" type="text" {...form.register("clarity")} />
              {form.formState.errors.clarity && (
                <p className="text-sm text-red-500">{form.formState.errors.clarity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cut">Cut</Label>
              <Select onValueChange={form.setValue.bind(null, 'cut')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Cut" defaultValue={initialData?.cut || ""}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="polish">Polish</Label>
              <Input id="polish" type="text" {...form.register("polish")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symmetry">Symmetry</Label>
              <Input id="symmetry" type="text" {...form.register("symmetry")} />
            </div>
            <div>
              <Label htmlFor="fluorescence">Fluorescence</Label>
              <Input id="fluorescence" type="text" {...form.register("fluorescence")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input id="certificateNumber" type="text" {...form.register("certificateNumber")} />
            </div>
            <div>
              <Label htmlFor="certificateUrl">Certificate URL</Label>
              <Input id="certificateUrl" type="text" {...form.register("certificateUrl")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="depth">Depth</Label>
              <Input id="depth" type="number" step="0.01" {...form.register("depth", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="table">Table</Label>
              <Input id="table" type="number" step="0.01" {...form.register("table", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="measurements">Measurements</Label>
              <Input id="measurements" type="text" {...form.register("measurements")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lab">Lab</Label>
              <Input id="lab" type="text" {...form.register("lab")} />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" type="text" {...form.register("location")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" type="text" {...form.register("availability")} />
            </div>
            <div>
              <Label htmlFor="color_type">Color Type</Label>
              <Input id="color_type" type="text" {...form.register("color_type")} />
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comment</Label>
            <Textarea id="comment" {...form.register("comment")} />
          </div>

          <div>
            <Label htmlFor="picture">Picture URL</Label>
            <Input id="picture" type="text" {...form.register("picture")} />
          </div>

          <div>
            <Label htmlFor="store_visible">Store Visible</Label>
            <Switch id="store_visible" checked={form.watch("store_visible")} onCheckedChange={form.setValue.bind(null, 'store_visible')} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
