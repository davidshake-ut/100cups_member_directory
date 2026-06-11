"use client";

import { useRef, useState } from "react";

const MAX_PX = 512;
const JPEG_QUALITY = 0.85;

async function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_PX || height > MAX_PX) {
          if (width >= height) {
            height = Math.round((height * MAX_PX) / width);
            width = MAX_PX;
          } else {
            width = Math.round((width * MAX_PX) / height);
            height = MAX_PX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoUploadSection({
  uploadAction,
  removeAction,
  currentPhotoUrl,
  initials,
}: {
  uploadAction: (formData: FormData) => Promise<void>;
  removeAction: () => Promise<void>;
  currentPhotoUrl: string | null;
  initials: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [processing, setProcessing] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const base64 = await resizeToBase64(file);
      setPreview(base64);
      if (hiddenRef.current) hiddenRef.current.value = base64;
    } catch {
      setPreview(currentPhotoUrl);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-full bg-accent/15 font-display text-2xl text-accent">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your profile photo" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1">
        <form
          action={uploadAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="photoBase64" ref={hiddenRef} />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm"
            onChange={handleFileChange}
          />
          <button
            type="submit"
            disabled={processing}
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {processing ? "Processing…" : "Upload"}
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          JPEG, PNG, WebP, or GIF. Up to 5 MB.
        </p>
        {preview ? (
          <form action={removeAction} className="mt-3">
            <button
              type="submit"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Remove current photo
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
