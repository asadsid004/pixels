"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

export interface ImageUploadProps {
  /**
   * Accepted image types (default: "image/*")
   */
  accept?: string;
  /**
   * Maximum file size in bytes (default: 10MB)
   */
  maxSize?: number;
  /**
   * Callback when image is selected
   */
  onImageSelect: (file: File | null, imageElement: HTMLImageElement | null) => void;
  /**
   * Current file value
   */
  value?: File | null;
  /**
   * Custom label for the dropzone
   */
  label?: string;
  /**
   * Custom description text
   */
  description?: string;
  /**
   * Disable the dropzone
   */
  disabled?: boolean;
  /**
   * Custom className for the container
   */
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getAcceptedFormats = (accept?: string): string => {
  if (!accept || accept === "image/*") return "JPG, PNG, WebP, GIF";
  const formats = accept
    .split(",")
    .map((format) => format.trim().replace(".", "").replace("image/", "").toUpperCase());
  return formats.join(", ");
};

export const ImageUpload = ({
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  onImageSelect,
  value,
  label = "Upload your image",
  description,
  disabled = false,
  className,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error(`Image size must be less than ${formatFileSize(maxSize)}`);
        return false;
      }

      // Check file type if specific accept is provided
      if (accept && accept !== "image/*") {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const isAccepted = acceptedTypes.some((type) => {
          if (type.includes("*")) {
            return file.type.startsWith(type.split("/")[0]);
          }
          return type === fileExtension || type === file.type;
        });

        if (!isAccepted) {
          toast.error(
            `Image type not accepted. Please upload: ${getAcceptedFormats(accept)}`
          );
          return false;
        }
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            onImageSelect(file, img);
            toast.success("Image uploaded successfully");
          };
          img.onerror = () => {
            toast.error("Failed to load image");
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    [validateFile, onImageSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const defaultDescription =
    description ||
    `Drag and drop your image here, or click to browse. Accepted formats: ${getAcceptedFormats(accept)}. Max size: ${formatFileSize(maxSize)}.`;

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {!value && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!disabled ? handleBrowseClick : undefined}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "cursor-pointer",
            "min-h-[240px]"
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Icon */}
            <div
              className={cn(
                "rounded-full p-4 transition-colors",
                isDragging ? "bg-primary/10" : "bg-accent"
              )}
            >
              <Upload
                className={cn(
                  "h-10 w-10 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={1.5}
              />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{label}</h3>
              <p className="text-muted-foreground max-w-xs text-sm">
                {defaultDescription}
              </p>
            </div>

            {/* Button */}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Images
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};