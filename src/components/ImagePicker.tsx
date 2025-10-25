import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ImageData {
  url: string;
  name: string;
  size: number;
  uploaded_at: string;
}

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const ImagePicker = ({ isOpen, onClose, onSelect }: ImagePickerProps) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/a485142b-5321-477b-a019-6188b5a23541');
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
      setSelectedImage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Images" size={24} className="text-primary" />
            Выберите изображение из галереи
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="ImageOff" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Галерея пуста</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.url}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === image.url
                      ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedImage(image.url)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === image.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <Icon name="Check" size={24} className="text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-secondary/50">
                    <p className="text-xs truncate font-medium">{image.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleSelect}
                disabled={!selectedImage}
                className="flex-1"
              >
                <Icon name="Check" size={18} className="mr-2" />
                Выбрать изображение
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                <Icon name="X" size={18} className="mr-2" />
                Отмена
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePicker;
