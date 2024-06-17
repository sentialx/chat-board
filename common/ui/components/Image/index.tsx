import React, { useCallback, useEffect, useRef, useState } from "react";

import { WithVisible } from "../../types/state";
import { Skeleton } from "../Skeleton";

import { ImageContainer, StyledImage } from "./style";

export interface ImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string;
  skeleton?: React.ReactNode | true;
  showSkeleton?: boolean;
  lazy?: boolean;
  alt?: string;
  fill?: boolean;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      skeleton,
      draggable = true,
      children,
      showSkeleton = false,
      lazy = false,
      alt,
      fill,
      ...props
    },
    ref,
  ) => {
    // if (!src?.startsWith("http")) {
    //   src = "http://" + window.location.host + src;
    // }

    const imageRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setLoaded] = useState(false);

    const onLoad = useCallback(() => {
      setLoaded(true);
    }, []);

    useEffect(() => {
      setLoaded(false);
    }, [src]);

    useEffect(() => {
      if (imageRef.current && imageRef.current.complete) {
        onLoad();
      }
    }, [ref, onLoad]);

    let _skeleton: React.ReactNode | undefined = undefined;

    if (skeleton === true || skeleton == null) {
      _skeleton = <Skeleton />;
    } else if (skeleton) {
      _skeleton = <>{skeleton}</>;
    }

    return (
      <ImageContainer ref={ref} draggable={!!draggable} $fill={fill} {...props}>
        {src != null && typeof src === "string" && (
          <>
            <StyledImage
              ref={imageRef}
              src={src}
              onLoad={onLoad}
              $loaded={isLoaded || !lazy}
              draggable={draggable}
              $draggable={!!draggable}
              alt={alt}
              loading="lazy"
              decoding="async"
            />
          </>
        )}
        {!isLoaded && lazy && showSkeleton && _skeleton}
        {children}
      </ImageContainer>
    );
  },
);

Image.displayName = "Image";
