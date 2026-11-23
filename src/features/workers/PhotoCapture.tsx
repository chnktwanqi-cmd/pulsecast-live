import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus } from 'lucide-react';

const MAX_BYTES = 5 * 1024 * 1024;

export async function fileToPhotoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > MAX_BYTES) throw new Error('Photo must be 5 MB or smaller.');
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const max = 480;
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not read that photo.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read that photo.'));
    image.src = src;
  });
}

export function PhotoCapture({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState('');

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      setMessage('');
      onChange(await fileToPhotoDataUrl(file));
    } catch (caught) {
      onChange(null);
      setMessage(caught instanceof Error ? caught.message : 'Could not use that photo.');
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('Camera capture is not available here. Upload a photo instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      setMessage('');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setMessage('Camera capture is not available here. Upload a photo instead.');
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 480;
    const height = video.videoHeight || 480;
    const max = 480;
    const scale = Math.min(1, max / Math.max(width, height));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL('image/jpeg', 0.82));
    stopCamera();
  }

  return (
    <div>
      <div className="text-sm font-semibold text-slate-800">Profile photo</div>
      <p className="mt-1 text-xs text-slate-500">Required. Image files up to 5 MB, or a camera capture where the browser allows it.</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div
          data-testid="photo-preview"
          className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50"
        >
          {value ? <img src={value} alt="Profile preview" className="h-full w-full object-cover" /> : <span className="px-2 text-center text-[11px] text-slate-400">No photo</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="h-3.5 w-3.5" /> Upload photo
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700" onClick={() => (cameraOn ? stopCamera() : void startCamera())}>
            <Camera className="h-3.5 w-3.5" /> {cameraOn ? 'Close camera' : 'Use camera'}
          </button>
          <input
            ref={inputRef}
            data-testid="photo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </div>
      </div>
      {cameraOn ? (
        <div className="mt-3 max-w-sm">
          <video ref={videoRef} className="aspect-square w-full rounded-2xl bg-slate-900 object-cover" muted playsInline />
          <button type="button" className="mt-2 rounded-full bg-pink-600 px-3 py-2 text-xs font-semibold text-white" onClick={captureFrame}>
            Capture photo
          </button>
        </div>
      ) : null}
      {message || error ? <p className="mt-2 text-xs font-medium text-rose-600">{message || error}</p> : null}
    </div>
  );
}
