
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreTemplates, templates, StoreTemplate } from "./StoreTemplates";
import { Upload, Save, Palette, Type, Image, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreCustomizationProps {
  onClose: () => void;
}

export function StoreCustomization({ onClose }: StoreCustomizationProps) {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Premium Diamond Collection",
    storeDescription: "Certified diamonds with exceptional quality and craftsmanship",
    logoUrl: "",
    bannerUrl: "",
    selectedTemplate: "modern-minimalist",
    customColors: {
      primary: "#3b82f6",
      secondary: "#9ca3af",
      background: "#ffffff",
      accent: "#10b981"
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleTemplateSelect = (template: StoreTemplate) => {
    setStoreSettings(prev => ({
      ...prev,
      selectedTemplate: template.id,
      customColors: template.colors
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save store customization to localStorage (fallback) or FastAPI
      localStorage.setItem('store_customization', JSON.stringify(storeSettings));
      
      toast({
        title: "Store Updated",
        description: "Your store customization has been saved successfully.",
      });
      
      // Apply the changes immediately (you could dispatch to a context here)
      setTimeout(() => {
        window.location.reload(); // Refresh to apply changes
      }, 1000);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save store customization. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Enter your store name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoUrl">Store Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      value={storeSettings.logoUrl}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bannerUrl">Banner Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bannerUrl"
                      value={storeSettings.bannerUrl}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, bannerUrl: e.target.value }))}
                      placeholder="https://example.com/banner.jpg"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Logo Preview */}
              {storeSettings.logoUrl && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm font-medium mb-2">Logo Preview:</p>
                  <img 
                    src={storeSettings.logoUrl} 
                    alt="Store Logo" 
                    className="h-16 object-contain"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Choose Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StoreTemplates
                onSelectTemplate={handleTemplateSelect}
                selectedTemplate={storeSettings.selectedTemplate}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(storeSettings.customColors).map(([key, color]) => (
                  <div key={key}>
                    <Label htmlFor={key} className="capitalize">{key}</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id={key}
                        type="color"
                        value={color}
                        onChange={(e) => setStoreSettings(prev => ({
                          ...prev,
                          customColors: { ...prev.customColors, [key]: e.target.value }
                        }))}
                        className="w-12 h-10 p-1 rounded"
                      />
                      <Input
                        value={color}
                        onChange={(e) => setStoreSettings(prev => ({
                          ...prev,
                          customColors: { ...prev.customColors, [key]: e.target.value }
                        }))}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Store Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
                  placeholder="Describe your store and what makes it special..."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Store Preview</h4>
                <div className="bg-white p-4 rounded border">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{storeSettings.storeName}</h3>
                  <p className="text-gray-600 text-sm">{storeSettings.storeDescription}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
