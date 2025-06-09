
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { StoreHeader } from "@/components/store/StoreHeader";
import { EnhancedStoreFilters } from "@/components/store/EnhancedStoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { Helmet } from "react-helmet-async";

export default function StorePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds);

  // SEO meta data
  const pageTitle = `Premium Diamond Collection - ${diamonds.length} Certified Diamonds`;
  const pageDescription = `Discover our exquisite collection of ${diamonds.length} certified diamonds. From brilliant rounds to elegant emeralds, find your perfect diamond with GIA certification, competitive prices, and exceptional quality.`;
  const keywords = "diamonds, certified diamonds, GIA diamonds, diamond jewelry, engagement rings, diamond collection, premium diamonds, loose diamonds";

  useEffect(() => {
    // Set structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Premium Diamond Collection",
      "description": pageDescription,
      "url": window.location.href,
      "numberOfItems": diamonds.length,
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Diamond Collection",
        "itemListElement": filteredDiamonds.slice(0, 20).map((diamond, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": `${diamond.carat}ct ${diamond.shape} Diamond ${diamond.color} ${diamond.clarity}`,
          "description": diamond.description || `Beautiful ${diamond.carat} carat ${diamond.shape} diamond with ${diamond.color} color and ${diamond.clarity} clarity.`,
          "sku": diamond.stockNumber,
          "offers": {
            "@type": "Offer",
            "price": diamond.price,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }))
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [diamonds, filteredDiamonds]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          {/* SEO-optimized header section */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  Premium Certified Diamond Collection
                </h1>
                <p className="text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
                  Discover our exclusive collection of {diamonds.length} certified diamonds. 
                  Each stone is carefully selected for exceptional quality, brilliance, and value. 
                  From classic round brilliants to rare fancy shapes, find your perfect diamond.
                </p>
                {diamonds.length > 0 && (
                  <div className="flex justify-center space-x-8 text-sm text-slate-500">
                    <span>✓ GIA Certified</span>
                    <span>✓ Competitive Pricing</span>
                    <span>✓ Premium Quality</span>
                    <span>✓ {diamonds.length} Diamonds Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <StoreHeader 
            totalDiamonds={filteredDiamonds.length}
            onOpenFilters={() => setIsFilterOpen(true)}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Desktop Filters Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-8">
                  <EnhancedStoreFilters
                    filters={filters}
                    onUpdateFilter={updateFilter}
                    onClearFilters={clearFilters}
                    diamonds={diamonds}
                  />
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                    Browse Our Diamond Collection
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {filteredDiamonds.length} of {diamonds.length} premium certified diamonds
                    </div>
                  </div>
                </div>
                
                <StoreGrid 
                  diamonds={filteredDiamonds}
                  loading={loading}
                  error={error}
                  onUpdate={refetch}
                />
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          <EnhancedStoreFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            diamonds={diamonds}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            isMobile
          />
        </div>
      </Layout>
    </>
  );
}
