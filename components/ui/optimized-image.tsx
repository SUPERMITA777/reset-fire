"use client";

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/logo-reset-default.png',
  className,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  style,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!src || src.trim() === '') {
      return fallback;
    }
    return src;
  });
  
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
      setHasError(true);
      onError?.();
    }
  };

  const commonProps = {
    alt,
    className: cn(className),
    onError: handleError,
    style,
    ...props,
  };

  if (fill) {
    return (
      <Image
        {...commonProps}
        src={imgSrc}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        priority={priority}
      />
    );
  }

  return (
    <Image
      {...commonProps}
      src={imgSrc}
      width={width || 300}
      height={height || 200}
      priority={priority}
    />
  );
} 