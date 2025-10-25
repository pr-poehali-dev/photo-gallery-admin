import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface GalleryItem {
  id: number;
  image_url: string;
  title: string;
  description: string;
  created_at: string;
}

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fame List
            </h1>
            <a
              href="/admin"
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Icon name="Lock" size={18} />
              Admin
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="Image" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No items yet</h2>
            <p className="text-muted-foreground">Add your first fame list item from the admin panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <Card
                key={item.id}
                className="group cursor-pointer overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-4xl w-full bg-card border border-border rounded-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[3/4] md:aspect-auto">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {selectedItem.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {selectedItem.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Calendar" size={16} />
                    {new Date(selectedItem.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="mt-8 w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                >
                  <Icon name="X" size={20} />
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
