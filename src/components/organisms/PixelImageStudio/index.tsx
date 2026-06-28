import React from "react";
import { usePixelImageStudio } from "./usePixelImageStudio";
import { PixelLabVariant } from "./variants/PixelLabVariant";

export const PixelImageStudio = () => {
  const studio = usePixelImageStudio();

  return <PixelLabVariant studio={studio} />;
};
