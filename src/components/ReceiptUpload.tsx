import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptUploadProps {
  onImageReady: (file: File) => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onImageReady }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageReady(file);
  }, [onImageReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="section-title flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-primary" />
        Receipt
      </h2>

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.label
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`drop-zone cursor-pointer block ${isDragging ? 'drop-zone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground">Drop receipt photo here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-border"
          >
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full max-h-64 object-contain bg-muted/50"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiptUpload;
