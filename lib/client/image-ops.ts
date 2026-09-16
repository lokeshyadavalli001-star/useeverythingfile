/**
 * Client-Side Image Operations
 * High-performance, 100% in-browser image processing with zero server uploads.
 */

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

export class ClientImageOps {
  /**
   * Loads an image file or blob into an HTMLImageElement
   */
  public static async loadImage(source: Blob | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = typeof source === "string" ? source : URL.createObjectURL(source);

      img.onload = () => {
        if (typeof source !== "string") {
          URL.revokeObjectURL(url);
        }
        resolve(img);
      };
      img.onerror = () => {
        if (typeof source !== "string") {
          URL.revokeObjectURL(url);
        }
        reject(new Error("Failed to load image file. File may be corrupted or unreadable."));
      };

      img.src = url;
    });
  }

  /**
   * Compresses an image with adjustable quality (0.01 - 1.0)
   */
  public static async compressImage(
    file: File | Blob,
    quality: number = 0.8,
    targetMime: "image/jpeg" | "image/webp" | "image/png" = "image/jpeg"
  ): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await this.loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire canvas context.");

    if (targetMime === "image/jpeg") {
      // Solid white background for JPG
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b || new Blob()),
        targetMime,
        quality
      );
    });

    return { blob, width: canvas.width, height: canvas.height };
  }

  /**
   * Resizes an image by exact dimensions or scale factor
   */
  public static async resizeImage(
    file: File | Blob,
    options: {
      width?: number;
      height?: number;
      scale?: number; // e.g. 0.5 for 50%
      maintainAspectRatio?: boolean;
      format?: "image/jpeg" | "image/png" | "image/webp";
      quality?: number;
    }
  ): Promise<{ blob: Blob; width: number; height: number }> {
    const img = await this.loadImage(file);
    const origWidth = img.naturalWidth;
    const origHeight = img.naturalHeight;

    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (options.scale) {
      targetWidth = Math.round(origWidth * options.scale);
      targetHeight = Math.round(origHeight * options.scale);
    } else if (options.width && options.height) {
      targetWidth = options.width;
      targetHeight = options.height;
    } else if (options.width) {
      targetWidth = options.width;
      targetHeight = options.maintainAspectRatio !== false
        ? Math.round((origHeight * targetWidth) / origWidth)
        : origHeight;
    } else if (options.height) {
      targetHeight = options.height;
      targetWidth = options.maintainAspectRatio !== false
        ? Math.round((origWidth * targetHeight) / origHeight)
        : origWidth;
    }

    // Guard against 0 or negative dimensions
    targetWidth = Math.max(1, targetWidth);
    targetHeight = Math.max(1, targetHeight);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire canvas context.");

    // Enable smooth bicubic scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const format = options.format || (file.type as any) || "image/jpeg";
    if (format === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b || new Blob()),
        format,
        options.quality ?? 0.9
      );
    });

    return { blob, width: targetWidth, height: targetHeight };
  }

  /**
   * Converts format between JPG, PNG, and WebP
   */
  public static async convertFormat(
    file: File | Blob,
    targetFormat: "image/jpeg" | "image/png" | "image/webp",
    quality: number = 0.92,
    backgroundColor: string = "#FFFFFF"
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire canvas context.");

    if (targetFormat === "image/jpeg") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b || new Blob()),
        targetFormat,
        quality
      );
    });
  }

  /**
   * Crops an image based on crop rectangle coordinates, zoom, and rotation
   */
  public static async cropImage(
    file: File | Blob,
    cropArea: { x: number; y: number; width: number; height: number },
    rotationDeg: number = 0,
    outputFormat: "image/png" | "image/jpeg" = "image/png"
  ): Promise<Blob> {
    const img = await this.loadImage(file);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropArea.width);
    canvas.height = Math.round(cropArea.height);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire canvas context.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (outputFormat === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply rotation if needed
    if (rotationDeg !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (rotationDeg !== 0) {
      ctx.restore();
    }

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b || new Blob()),
        outputFormat,
        0.95
      );
    });
  }

  /**
   * Rotates an image by specified degrees (90, 180, 270)
   */
  public static async rotateImage(
    file: File | Blob,
    angleDeg: number
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement("canvas");
    const isSwap = Math.abs(angleDeg % 180) === 90;
    canvas.width = isSwap ? img.naturalHeight : img.naturalWidth;
    canvas.height = isSwap ? img.naturalWidth : img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire canvas context.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b || new Blob()),
        "image/png",
        0.95
      );
    });
  }
}

