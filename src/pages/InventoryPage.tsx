
import React, { useEffect, useState } from 'react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryTableLoading } from '@/components/inventory/InventoryTableLoading';
import { AddDiamondButton } from '@/components/inventory/AddDiamondButton';
import { BulkUploadButton } from '@/components/inventory/BulkUploadButton';
import { GIAScannerButton } from '@/components/gia/GIAScannerButton';
import { GIACertificateForm } from '@/components/inventory/GIACertificateForm';
import { useOpenAccess } from '@/context/OpenAccessContext';
import { useEnhancedUserTracking } from '@/hooks/useEnhancedUserTracking';
import { useInventoryData } from '@/hooks/useInventoryData';

export default function InventoryPage() {
  const { hasAccess, isBlocked, loading } = useOpenAccess();
  const { trackEnhancedPageVisit, trackFeatureUsage } = useEnhancedUserTracking();
  const { diamonds, loading: inventoryLoading, handleRefresh } = useInventoryData();
  const [extractedGIAData, setExtractedGIAData] = useState<any>(null);
  
  // Track page visit
  useEffect(() => {
    trackEnhancedPageVisit('/inventory', 'Inventory Management');
  }, []);

  const handleGIAScanResult = (result: string) => {
    console.log('📱 INVENTORY: GIA scan result received:', result);
    
    try {
      const giaData = JSON.parse(result);
      console.log('📱 INVENTORY: Parsed GIA data:', giaData);
      
      setExtractedGIAData(giaData);
      
      trackFeatureUsage('gia_scanner_inventory', { 
        scan_result: 'success',
        certificate_number: giaData.certificateNumber,
        shape: giaData.shape,
        carat: giaData.carat
      });
    } catch (error) {
      console.error('❌ INVENTORY: Failed to parse GIA scan result:', error);
      trackFeatureUsage('gia_scanner_inventory', { 
        scan_result: 'error',
        error: 'Failed to parse scan result'
      });
    }
  };

  const handleGIAConfirm = () => {
    setExtractedGIAData(null);
    handleRefresh(); // Refresh inventory after adding
  };

  const handleGIACancel = () => {
    setExtractedGIAData(null);
  };

  if (loading) {
    return <InventoryTableLoading />;
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Blocked</h1>
          <p className="text-gray-600">Your access has been restricted. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <InventoryHeader 
          totalCount={diamonds.length}
          onRefresh={handleRefresh}
          loading={inventoryLoading}
        />
        <div className="flex gap-2">
          <GIAScannerButton 
            onScanResult={handleGIAScanResult}
            variant="outline"
          />
          <AddDiamondButton />
          <BulkUploadButton />
        </div>
      </div>

      <InventoryTable 
        data={diamonds}
        loading={inventoryLoading}
      />

      {/* GIA Certificate Form Modal */}
      {extractedGIAData && (
        <GIACertificateForm
          extractedData={extractedGIAData}
          onConfirm={handleGIAConfirm}
          onCancel={handleGIACancel}
        />
      )}
    </div>
  );
}
