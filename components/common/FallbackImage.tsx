'use client';

import { ImgHTMLAttributes, ReactNode, useEffect, useState } from 'react';

import { api } from '@/services/api';

interface FallbackImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  src?: string | null;
  fallback: ReactNode;
}

function isProtectedProfileImage(src: string) {
  if (/^(data|blob):/i.test(src)) {
    return false;
  }

  try {
    const pathname = new URL(src, window.location.origin).pathname;
    return (
      pathname === '/api/auth/me/profile-image/' ||
      /^\/api\/accounts\/institution-users\/[^/]+\/profile-image\/$/.test(
        pathname,
      )
    );
  } catch {
    return false;
  }
}

export function FallbackImage({
  src,
  alt,
  fallback,
  onError,
  ...imgProps
}: FallbackImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [authenticatedImage, setAuthenticatedImage] = useState<{
    source: string;
    url: string;
  } | null>(null);
  const needsAuthentication = Boolean(src && isProtectedProfileImage(src));
  const authenticatedSrc =
    authenticatedImage && authenticatedImage.source === src
      ? authenticatedImage.url
      : null;

  useEffect(() => {
    if (!src || !isProtectedProfileImage(src)) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    let objectUrl: string | null = null;

    api
      .downloadBlob(src, { signal: controller.signal })
      .then(({ blob }) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setAuthenticatedImage({ source: src, url: objectUrl });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFailedSrc(src);
        }
      });

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!src || failedSrc === src || (needsAuthentication && !authenticatedSrc)) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...imgProps}
      src={authenticatedSrc || src}
      alt={alt}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
