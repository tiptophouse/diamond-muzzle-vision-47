import { useState } from 'react';
import { UseFormReturn, FieldErrors } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiamondFormData } from '@/components/inventory/form/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Diamond, FileText, Ruler, DollarSign, Store, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile-optimized form sections
import { MobileDiamondDetails } from './mobile/MobileDiamondDetails';
import { MobileCertificateInfo } from './mobile/MobileCertificateInfo';
import { MobilePhysicalMeasurements } from './mobile/MobilePhysicalMeasurements';
import { MobileBusinessInfo } from './mobile/MobileBusinessInfo';
import { MobileInventorySettings } from './mobile/MobileInventorySettings';

interface MobileDiamondFormProps {
  form: UseFormReturn<DiamondFormData>;
  onSubmit: (data: DiamondFormData) => Promise<void>;
  isSubmitting: boolean;
  scannedData: Partial<DiamondFormData>;
}

interface FormSection {
  id: string;
  title: string;
  icon: any;
  component: any;
  defaultOpen?: boolean;
}

export function MobileDiamondForm({ form, onSubmit, isSubmitting, scannedData }: MobileDiamondFormProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['diamond-details']));
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const getSectionStatus = (sectionId: string, fields: string[]) => {
    const filledFields = fields.filter(field => {
      const value = watch(field as keyof DiamondFormData);
      return value !== '' && value !== null && value !== undefined && value !== 0;
    });
    
    if (filledFields.length === 0) return 'empty';
    if (filledFields.length === fields.length) return 'complete';
    return 'partial';
  };

  const sections: FormSection[] = [
    {
      id: 'diamond-details',
      title: 'Diamond Details',
      icon: Diamond,
      component: MobileDiamondDetails,
      defaultOpen: true
    },
    {
      id: 'certificate-info',
      title: 'Certificate Information', 
      icon: FileText,
      component: MobileCertificateInfo
    },
    {
      id: 'measurements',
      title: 'Physical Measurements',
      icon: Ruler,
      component: MobilePhysicalMeasurements
    },
    {
      id: 'business-info',
      title: 'Pricing & Business',
      icon: DollarSign,
      component: MobileBusinessInfo
    },
    {
      id: 'inventory-settings',
      title: 'Inventory & Store',
      icon: Store,
      component: MobileInventorySettings
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-success';
      case 'partial': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-success';
      case 'partial': return 'bg-warning';
      default: return 'bg-muted-foreground/30';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-safe">
      <Card className="border-success/20 bg-gradient-to-r from-success/5 to-success/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-success" />
            Auto-Filled from Certificate
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Review and complete the information below
          </p>
        </CardHeader>
      </Card>

      {sections.map((section) => {
        const sectionFields = getSectionFields(section.id);
        const status = getSectionStatus(section.id, sectionFields);
        const isOpen = openSections.has(section.id);
        const Icon = section.icon;

        return (
          <Card key={section.id} className="overflow-hidden">
            <Collapsible 
              open={isOpen} 
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger className="w-full">
                <CardHeader className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className={cn(
                          "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                          getStatusDot(status)
                        )} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-sm">{section.title}</h3>
                        <p className={cn("text-xs", getStatusColor(status))}>
                          {status === 'complete' ? 'Complete' : 
                           status === 'partial' ? 'Partially filled' : 'Not started'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  <section.component
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 -mx-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="flex-1"
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-success hover:bg-success/90 active:scale-95 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Diamond...' : 'Add to Inventory'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function getSectionFields(sectionId: string): string[] {
  switch (sectionId) {
    case 'diamond-details':
      return ['stockNumber', 'shape', 'carat', 'color', 'clarity', 'cut', 'fluorescence', 'polish', 'symmetry'];
    case 'certificate-info':
      return ['certificateNumber', 'lab', 'certificateUrl', 'certificateComment'];
    case 'measurements':
      return ['length', 'width', 'depth', 'ratio', 'tablePercentage', 'depthPercentage', 'gridle', 'culet'];
    case 'business-info':
      return ['price', 'pricePerCarat', 'rapnet'];
    case 'inventory-settings':
      return ['status', 'storeVisible', 'picture'];
    default:
      return [];
  }
}