import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PremiumStoreHeader } from "@/components/store/PremiumStoreHeader";
import { EnhancedStoreFilters } from "@/components/store/EnhancedStoreFilters";
import { PremiumStoreGrid } from "@/components/store/PremiumStoreGrid";
import { useEnhancedStoreData } from "@/hooks/useEnhancedStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { Helmet } from "react-helmet-async";

export default function StorePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { diamonds, loading, error, refetch } = useEnhancedStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds);

  // Enhanced SEO meta data
  const pageTitle = `Luxury Diamond Collection - ${diamonds.length} Premium Certified Diamonds`;
  const pageDescription = `Explore our exclusive collection of ${diamonds.length} premium certified diamonds. From brilliant rounds to rare fancy shapes, each stone is expertly selected for exceptional quality, brilliance, and investment value.`;
  const keywords = "luxury diamonds, premium diamonds, certified diamonds, GIA diamonds, diamond jewelry, engagement rings, investment diamonds, rare diamonds";

  useEffect(() => {
    // Set structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Luxury Diamond Collection",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          {/* Premium Store Header */}
          <PremiumStoreHeader 
            totalDiamonds={filteredDiamonds.length}
            onOpenFilters={() => setIsFilterOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Desktop Filters Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
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
                <PremiumStoreGrid 
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
