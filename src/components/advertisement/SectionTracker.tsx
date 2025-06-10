
import { useEffect, useRef } from 'react';
import { useAdvertisementAnalytics } from '@/hooks/useAdvertisementAnalytics';

interface SectionTrackerProps {
  sectionId: string;
  children: React.ReactNode;
}

export function SectionTracker({ sectionId, children }: SectionTrackerProps) {
  const { trackSectionView } = useAdvertisementAnalytics();
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            trackSectionView(sectionId);
            hasTracked.current = true;
          }
        });
      },
      {
        threshold: 0.5, // Track when 50% of section is visible
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [sectionId, trackSectionView]);

  return (
    <div ref={sectionRef}>
      {children}
    </div>
  );
}
