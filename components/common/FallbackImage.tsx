'use client';

import { ImgHTMLAttributes, ReactNode, useState } from 'react';

interface FallbackImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback: ReactNode;
}

export function FallbackImage({ src, alt, fallback, onError, ...imgProps }: FallbackImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
