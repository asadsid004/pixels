/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Zap, Download } from 'lucide-react'
import { useState, useRef, useEffect, useDeferredValue } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { FilterControls } from '@/components/filter-controls'
import { Footer } from '@/components/footer'
import Features from '@/components/features'

const Page = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
  const [wasm, setWasm] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    vignette: 0,
    scale: 1,
    flipHorizontal: false,
    flipVertical: false,
    aspectRatio: 'original',
  });

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load WASM module on component mount
  useEffect(() => {
    async function loadWasm() {
      try {
        const wasmModule = await import("@/wasm");
        await wasmModule.default();
        setWasm(wasmModule);
        console.log("✅ WASM loaded successfully");
      } catch (error) {
        console.error("❌ Failed to load WASM:", error);
      }
    }
    loadWasm();
  }, []);

  // Draw original image on canvas
  useEffect(() => {
    if (originalImage && originalCanvasRef.current) {
      const canvas = originalCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
    }
  }, [originalImage]);

  // Draw processed image on canvas
  useEffect(() => {
    if (processedImage && processedCanvasRef.current) {
      const canvas = processedCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = processedImage.width;
      canvas.height = processedImage.height;
      ctx.putImageData(processedImage, 0, 0);
    }
  }, [processedImage]);

  const handleImageSelect = (file: File | null, imageElement: HTMLImageElement | null) => {
    setUploadedFile(file);
    setOriginalImage(imageElement);
    setProcessedImage(null);
  };

  const getImageData = (): ImageData | null => {
    if (!originalCanvasRef.current) return null;
    const ctx = originalCanvasRef.current.getContext("2d");
    if (!ctx) return null;
    return ctx.getImageData(
      0,
      0,
      originalCanvasRef.current.width,
      originalCanvasRef.current.height
    );
  };

  const applyFilters = async () => {
    if (!wasm || !originalImage) return;

    const imageData = getImageData();
    if (!imageData) return;

    setIsProcessing(true);

    // Run in a small timeout to allow UI to breathe
    setTimeout(() => {
      try {
        let currentData = new ImageData(
          new Uint8ClampedArray(imageData.data),
          imageData.width,
          imageData.height
        );

        // 1. Apply Scaling
        if (adjustments.scale !== 1) {
          const newWidth = Math.round(imageData.width * adjustments.scale);
          const newHeight = Math.round(imageData.height * adjustments.scale);

          if (newWidth > 0 && newHeight > 0) {
            const resizedPixels = wasm.resize(
              currentData.data,
              currentData.width,
              currentData.height,
              newWidth,
              newHeight
            );
            currentData = new ImageData(
              new Uint8ClampedArray(resizedPixels),
              newWidth,
              newHeight
            );
          }
        }


        // 1.5 Apply Crop (Aspect Ratio)
        if (adjustments.aspectRatio !== 'original') {
          const [ratioW, ratioH] = adjustments.aspectRatio.split(':').map(Number);
          const currentRatio = currentData.width / currentData.height;
          const targetRatio = ratioW / ratioH;

          let newWidth = currentData.width;
          let newHeight = currentData.height;

          if (currentRatio > targetRatio) {
            // Too wide, crop width
            newWidth = Math.round(currentData.height * targetRatio);
          } else {
            // Too tall, crop height
            newHeight = Math.round(currentData.width / targetRatio);
          }

          // Center crop
          const startX = Math.round((currentData.width - newWidth) / 2);
          const startY = Math.round((currentData.height - newHeight) / 2);

          const croppedPixels = wasm.crop(
            currentData.data,
            currentData.width,
            currentData.height,
            startX,
            startY,
            newWidth,
            newHeight
          );

          currentData = new ImageData(
            new Uint8ClampedArray(croppedPixels),
            newWidth,
            newHeight
          );
        }

        // 1.8 Apply Flips
        if (adjustments.flipHorizontal) {
          const flipped = wasm.flip_horizontal(currentData.data, currentData.width, currentData.height);
          currentData = new ImageData(new Uint8ClampedArray(flipped), currentData.width, currentData.height);
        }
        if (adjustments.flipVertical) {
          const flipped = wasm.flip_vertical(currentData.data, currentData.width, currentData.height);
          currentData = new ImageData(new Uint8ClampedArray(flipped), currentData.width, currentData.height);
        }

        // 2. Apply Base Filter
        switch (selectedFilter) {
          case 'grayscale':
            wasm.grayscale(currentData.data);
            break;
          case 'invert':
            wasm.invert(currentData.data);
            break;
          case 'sepia':
            wasm.sepia(currentData.data);
            break;
          case 'lofi':
            wasm.lofi(currentData.data);
            break;
          case 'vintage':
            wasm.vintage(currentData.data);
            break;
          case 'cyberpunk':
            wasm.cyberpunk(currentData.data);
            break;
          default:
            break;
        }

        // 3. Apply Adjustments
        if (adjustments.brightness !== 0) {
          wasm.brightness(currentData.data, adjustments.brightness);
        }
        if (adjustments.contrast !== 0) {
          wasm.contrast(currentData.data, adjustments.contrast);
        }
        if (adjustments.vignette !== 0) {
          wasm.vignette(currentData.data, currentData.width, currentData.height, adjustments.vignette);
        }

        setProcessedImage(currentData);
      } catch (error) {
        console.error("Error applying filter:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  };

  // Automatically apply filters when selection or adjustments change
  // Use deferred value to prevent blocking UI during updates
  const deferredAdjustments = useDeferredValue(adjustments);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, deferredAdjustments, originalImage, wasm]);

  const handleAdjustmentChange = (key: string, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSelectedFilter('none');
    setAdjustments({
      brightness: 0,
      contrast: 0,
      vignette: 0,
      scale: 1,
      flipHorizontal: false,
      flipVertical: false,
      aspectRatio: 'original',
    });
  };

  const downloadImage = () => {
    if (!processedCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = "processed-image.png";
    link.href = processedCanvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div>
      <div className='container mx-auto py-10 px-4 min-h-screen flex flex-col'>
        <div className='flex flex-col items-center gap-4 pt-10'>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium">Powered by WebAssembly</span>
          </div>
          <h1 className='text-4xl md:text-6xl font-semibold tracking-tight'>Pixels</h1>
          <p className='text-sm md:text-base text-center text-muted-foreground max-w-md mx-auto'>
            Real-time image processing at native speed. <br />Upload, transform, and export instantly.
          </p>
        </div>

        <div className='flex-1 py-10'>
          {!originalImage ? (
            <div className='flex flex-col gap-8'>
              <div className='mx-auto mt-10 max-w-2xl w-full'>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  value={uploadedFile}
                />
              </div>
              <Features />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex items-center justify-between mx-auto">
                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    setOriginalImage(null);
                    setProcessedImage(null);
                  }}
                  variant="outline"
                >
                  Upload New Image
                </Button>

                {processedImage && (
                  <Button onClick={downloadImage}>
                    <Download className="w-4 h-4" />
                    Download Result
                  </Button>
                )}
              </div>

              {/* Canvas Grid */}
              <div className="grid md:grid-cols-2 gap-4 mx-auto">
                {/* Original Image */}
                <Card className="overflow-hidden rounded-md shadow-none">
                  <div className="flex items-center gap-2 px-4">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <h3 className="font-semibold">Original</h3>
                  </div>
                  <div className="px-4 py-2">
                    <div className="relative overflow-hidden border">
                      <canvas
                        ref={originalCanvasRef}
                        className="w-full h-auto max-h-[700px] object-contain"
                      />
                    </div>
                  </div>
                  {originalImage && (
                    <div className="px-4 pb-2 text-sm text-muted-foreground">
                      {originalImage.width} x {originalImage.height}px
                    </div>
                  )}
                </Card>

                {/* Processed Image */}
                <Card className="overflow-hidden rounded-md shadow-none">
                  <div className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <h3 className="font-semibold">Processed</h3>
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    {processedImage ? (
                      <div className="relative overflow-hidden border">
                        <canvas
                          ref={processedCanvasRef}
                          className="w-full h-auto max-h-[700px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] rounded-lg border-2 border-dashed">
                        <div className="text-center space-y-2">
                          <Zap className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground font-medium">
                            Select a filter to process
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {processedImage && (
                    <div className="px-4 pb-2 text-sm text-muted-foreground">
                      {processedImage.width} x {processedImage.height}px
                    </div>
                  )}
                </Card>
              </div>

              {/* Filter Controls */}
              <FilterControls
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                adjustments={adjustments}
                onAdjustmentChange={handleAdjustmentChange as any}
                onReset={handleReset}
                isProcessing={isProcessing}
                wasmLoaded={!!wasm}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Page