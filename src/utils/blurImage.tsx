'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageBlur({ src, alt, width = 40, height = 40, fill, onError, ...props }: any) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Image
        alt={alt}
        src={src}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        {...(fill
          ? { fill: true }
          : { width, height }
        )}
        style={{ borderRadius: '50%', objectFit: 'cover', ...props.style }}
        className={loaded ? 'unblur' : ''}
        onLoad={() => setLoaded(true)}
        onError={onError}
        {...props}
      />
      <style jsx global>{`
        .unblur {
          animation: unblur .3s linear;
        }

        @keyframes unblur {
          from {
            filter: blur(15px);
          }
          to {
            filter: blur(0);
          }
        }
      `}</style>
    </>
  );
}
