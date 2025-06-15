
import { Diamond } from "@/components/inventory/InventoryTable";

export const useGem360Detection = (diamond: Diamond) => {
  // Enhanced Gem360 URL detection - check all possible sources
  const getGem360Url = () => {
    // Priority order: dedicated gem360Url field, then certificateUrl, then imageUrl
    const sources = [
      diamond.gem360Url,
      diamond.certificateUrl,
      diamond.imageUrl
    ];

    for (const url of sources) {
      if (url && url.includes('gem360')) {
        console.log('🔍 Found Gem360 URL in source:', url);
        return url;
      }
    }

    return null;
  };

  const gem360Url = getGem360Url();
  const hasGem360View = !!gem360Url;

  console.log('🔍 Diamond:', diamond.stockNumber);
  console.log('🔍 gem360Url field:', diamond.gem360Url);
  console.log('🔍 certificateUrl field:', diamond.certificateUrl);
  console.log('🔍 imageUrl field:', diamond.imageUrl);
  console.log('🔍 Final gem360Url:', gem360Url);
  console.log('🔍 hasGem360View:', hasGem360View);

  return { gem360Url, hasGem360View };
};
