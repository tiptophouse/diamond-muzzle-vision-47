import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { DiamondFormData } from '@/components/inventory/form/types';
import { MobileDiamondDetails } from './mobile/MobileDiamondDetails';
import { MobileCertificateInfo } from './mobile/MobileCertificateInfo';
import { MobilePhysicalMeasurements } from './mobile/MobilePhysicalMeasurements';
import { MobileBusinessInfo } from './mobile/MobileBusinessInfo';
import { MobileInventorySettings } from './mobile/MobileInventorySettings';
import { useFormValidation } from './form/useFormValidation';
import { getTelegramWebApp } from '@/utils/telegramWebApp';
import { Progress } from "@/components/ui/progress";

interface MobileDiamondFormProps {
  initialData?: Partial<DiamondFormData> | null;
  onSubmit: (data: DiamondFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

type FormSection = 'details' | 'certificate' | 'measurements' | 'business' | 'settings';

export function MobileDiamondForm({ initialData, onSubmit, onBack, isLoading = false }: MobileDiamondFormProps) {
  const [expandedSections, setExpandedSections] = useState<Set<FormSection>>(new Set(['details']));
  const [formProgress, setFormProgress] = useState(0);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: {
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      picture: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      storeVisible: true
    }
  });

  const { validateFormData, formatFormData } = useFormValidation();

  // Initialize form with scanned data
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key as keyof DiamondFormData, value);
        }
      });
      
      // Auto-expand relevant sections based on available data
      const sectionsToExpand = new Set<FormSection>(['details']);
      if (initialData.certificateNumber || initialData.certificateUrl) {
        sectionsToExpand.add('certificate');
      }
      if (initialData.length || initialData.width || initialData.depth) {
        sectionsToExpand.add('measurements');
      }
      if (initialData.pricePerCarat || initialData.rapnet) {
        sectionsToExpand.add('business');
      }
      setExpandedSections(sectionsToExpand);
    }
  }, [initialData, setValue]);

  // Calculate form completion progress
  useEffect(() => {
    const watchedValues = watch();
    const requiredFields = ['stockNumber', 'shape', 'carat', 'color', 'clarity'];
    const optionalFields = ['certificateNumber', 'pricePerCarat', 'length', 'width', 'depth'];
    
    const completedRequired = requiredFields.filter(field => 
      watchedValues[field as keyof DiamondFormData] && 
      String(watchedValues[field as keyof DiamondFormData]).trim() !== ''
    ).length;
    
    const completedOptional = optionalFields.filter(field => 
      watchedValues[field as keyof DiamondFormData] && 
      String(watchedValues[field as keyof DiamondFormData]).trim() !== ''
    ).length;
    
    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = completedRequired + completedOptional;
    const progress = (completedFields / totalFields) * 100;
    
    setFormProgress(Math.round(progress));
  }, [watch]);

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const toggleSection = (section: FormSection) => {
    const newExpanded = new Set(expandedSections);
    if (expandedSections.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
    
    // Haptic feedback
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  const handleFormSubmit = (data: DiamondFormData) => {
    if (!validateFormData(data)) {
      return;
    }

    const formattedData = formatFormData(data, showCutField);
    onSubmit(formattedData);
  };

  const sections = [
    { 
      id: 'details' as FormSection, 
      title: 'Diamond Details', 
      subtitle: 'Basic diamond characteristics',
      component: MobileDiamondDetails,
      required: true
    },
    { 
      id: 'certificate' as FormSection, 
      title: 'Certificate Information', 
      subtitle: 'Lab certification details',
      component: MobileCertificateInfo,
      required: false
    },
    { 
      id: 'measurements' as FormSection, 
      title: 'Physical Measurements', 
      subtitle: 'Precise diamond dimensions',
      component: MobilePhysicalMeasurements,
      required: false
    },
    { 
      id: 'business' as FormSection, 
      title: 'Business Information', 
      subtitle: 'Pricing and inventory details',
      component: MobileBusinessInfo,
      required: true
    },
    { 
      id: 'settings' as FormSection, 
      title: 'Inventory Settings', 
      subtitle: 'Store visibility and status',
      component: MobileInventorySettings,
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">Diamond Details</h1>
              <p className="text-xs text-muted-foreground">Complete form to add diamond</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="text-sm font-medium text-foreground">{formProgress}%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <Progress value={formProgress} className="h-1" />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4">
        {sections.map(({ id, title, subtitle, component: Component, required }) => {
          const isExpanded = expandedSections.has(id);
          
          return (
            <Card key={id} className={`transition-all duration-200 ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}>
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleSection(id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${required ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <div>
                      <CardTitle className="text-base font-medium">{title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0 animate-accordion-down">
                  <Component
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Submit Button */}
        <div className="pt-6 pb-8">
          <Button
            type="submit"
            className="w-full h-12 text-lg font-medium"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Adding Diamond...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Add to Inventory
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}