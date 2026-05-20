import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface MediaGalleryProps {
  media: string[];
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % media.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + media.length) % media.length);
    }
  };

  const renderGrid = () => {
    const count = media.length;

    if (count === 1) {
      return (
        <div 
          className="relative aspect-video w-full cursor-pointer group overflow-hidden rounded-md"
          onClick={() => setLightboxIndex(0)}
        >
          <img src={media[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Media" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="text-white" size={24} />
          </div>
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 aspect-video w-full">
          {media.slice(0, 2).map((url, i) => (
            <div 
              key={i} 
              className="relative cursor-pointer group overflow-hidden rounded-sm"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Media" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <Maximize2 className="text-white" size={20} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 aspect-video w-full">
          <div 
            className="relative cursor-pointer group overflow-hidden rounded-sm row-span-2"
            onClick={() => setLightboxIndex(0)}
          >
            <img src={media[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Media" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
              <Maximize2 className="text-white" size={24} />
            </div>
          </div>
          <div className="grid grid-rows-2 gap-1">
            {media.slice(1, 3).map((url, i) => (
              <div 
                key={i} 
                className="relative cursor-pointer group overflow-hidden rounded-sm"
                onClick={() => setLightboxIndex(i + 1)}
              >
                <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Media" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Maximize2 className="text-white" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-video w-full">
          {media.slice(0, 4).map((url, i) => (
            <div 
              key={i} 
              className="relative cursor-pointer group overflow-hidden rounded-sm"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Media" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <Maximize2 className="text-white" size={18} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 5 or more
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-video w-full">
        {media.slice(0, 3).map((url, i) => (
          <div 
            key={i} 
            className="relative cursor-pointer group overflow-hidden rounded-sm"
            onClick={() => setLightboxIndex(i)}
          >
            <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Media" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
              <Maximize2 className="text-white" size={18} />
            </div>
          </div>
        ))}
        <div 
          className="relative cursor-pointer group overflow-hidden rounded-sm"
          onClick={() => setLightboxIndex(3)}
        >
          <img src={media[3]} className="w-full h-full object-cover" alt="Media" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/70 transition-colors">
            <span className="text-white font-bold text-xl">+{media.length - 3}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderGrid()}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[1001]"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={24} />
            </button>

            {media.length > 1 && (
              <>
                <button 
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[1001]"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[1001]"
                  onClick={handleNext}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <motion.div 
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={media[lightboxIndex]} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                alt={`Media ${lightboxIndex + 1}`} 
              />
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                <p className="text-white text-sm font-medium">
                  {lightboxIndex + 1} / {media.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;