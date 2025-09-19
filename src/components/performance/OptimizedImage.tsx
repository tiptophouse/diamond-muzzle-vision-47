import * as React from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: "square" | "video" | "auto";
  loading?: "lazy" | "eager";
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  aspectRatio = "auto",
  loading = "lazy",
  className,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video", 
    auto: ""
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClasses[aspectRatio])}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "object-cover w-full h-full transition-all duration-300",
          isLoading && "opacity-0",
          !isLoading && "opacity-100",
          className
        )}
        {...props}
      />
    </div>
  );
}