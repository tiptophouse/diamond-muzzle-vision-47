import { Diamond } from "@/components/inventory/InventoryTable";

export function convertDiamondsToInventoryFormat(diamonds: any[], userId?: number): Diamond[] {
  const normalizeShape = (apiShape: string): string => {
    if (!apiShape) return 'Round';
    
    const shapeMap: Record<string, string> = {
      'round brilliant': 'Round',
      'round': 'Round',
      'princess': 'Princess',
      'cushion': 'Cushion',
      'emerald': 'Emerald',
      'oval': 'Oval',
      'pear': 'Pear',
      'marquise': 'Marquise',
      'radiant': 'Radiant',
      'asscher': 'Asscher',
      'heart': 'Heart'
    };
    
    const normalized = apiShape.toLowerCase().trim();
    return shapeMap[normalized] || apiShape.charAt(0).toUpperCase() + apiShape.slice(1).toLowerCase();
  };

  return diamonds.map((item, index) => ({
    id: item.id || `${item.stock || item.stock_number || 'diamond'}-${Date.now()}-${index}`,
    diamondId: item.id || item.diamond_id,
    stockNumber: item.stock || item.stock_number || item.stockNumber || `STOCK-${Date.now()}-${index}`,
    shape: normalizeShape(item.shape),
    carat: parseFloat((item.weight || item.carat || 0).toString()) || 0,
    color: (item.color || 'D').toUpperCase(),
    clarity: (item.clarity || 'FL').toUpperCase(),
    cut: item.cut || 'Excellent',
    price: Number(item.price_per_carat ? item.price_per_carat * (item.weight || item.carat) : item.price) || 0,
    status: item.status || 'Available',
    fluorescence: item.fluorescence || undefined,
    imageUrl: item.picture || item.imageUrl || undefined,
    store_visible: item.store_visible !== false, // Default to true if not specified
    certificateNumber: item.certificate_number || item.certificateNumber || undefined,
    lab: item.lab || undefined,
    certificateUrl: item.certificate_url || item.certificateUrl || undefined,
    
    // Enhanced media fields
    v360Url: item.v360_url || item.v360Url || undefined,
    gem360Url: item.gem360_url || item.gem360Url || undefined,
    videoUrl: item.video_url || item.videoUrl || undefined,
    certificateImageUrl: item.certificate_image_url || item.certificateImageUrl || undefined,
    giaReportPdf: item.gia_report_pdf || item.giaReportPdf || undefined,
    
    // Additional compatibility fields
    polish: item.polish || undefined,
    symmetry: item.symmetry || undefined,
    tablePercentage: item.table_percentage || undefined,
    depthPercentage: item.depth_percentage || undefined,
    length: item.length || undefined,
    width: item.width || undefined,
    depth: item.depth || undefined,
    ratio: item.ratio || undefined,
    gridle: item.gridle || undefined,
    culet: item.culet || undefined,
    rapnet: item.rapnet || undefined,
    pricePerCarat: item.price_per_carat || undefined,
    certificateComment: item.certificate_comment || undefined,
  }));
}

export function processDiamondDataForDashboard(diamonds: any[], userId?: number) {
  return {
    stats: {
      totalDiamonds: diamonds.length,
      matchedPairs: 0,
      totalLeads: 0,
      activeSubscriptions: 0
    },
    inventoryByShape: diamonds.reduce((acc, d) => {
      const existing = acc.find(item => item.name === d.shape);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: d.shape, value: 1 });
      }
      return acc;
    }, [] as any[]),
    salesByCategory: []
  };
}
