import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Person {
  id: number;
  image_url: string;
  name: string;
  bio: string;
  category_id: number;
  category_name?: string;
  category_color?: string;
  telegram_username?: string;
  created_at: string;
}

const Gallery = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [personsRes, categoriesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a'),
        fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a?type=categories')
      ]);
      
      const personsData = await personsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setPersons(personsData.items || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersons = activeFilter 
    ? persons.filter(p => p.category_id === activeFilter)
    : persons;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Star" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  TG FAME
                </h1>
                <p className="text-sm text-muted-foreground">Список личностей Telegram</p>
              </div>
            </div>
            <a
              href="/admin"
              className="px-6 py-2.5 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold shadow-lg"
            >
              <Icon name="Shield" size={18} />
              Админ
            </a>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeFilter === null
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105'
                  : 'bg-secondary/50 hover:bg-secondary text-secondary-foreground'
              }`}
            >
              Все ({persons.length})
            </button>
            {categories.map(cat => {
              const count = persons.filter(p => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === cat.id
                      ? 'text-white shadow-lg scale-105'
                      : 'bg-secondary/50 hover:bg-secondary text-secondary-foreground'
                  }`}
                  style={
                    activeFilter === cat.id
                      ? { backgroundColor: cat.color }
                      : {}
                  }
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {filteredPersons.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="UserX" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">
              {activeFilter ? 'Никого нет в этой категории' : 'Пока нет личностей'}
            </h2>
            <p className="text-muted-foreground">
              {activeFilter ? 'Попробуйте выбрать другую категорию' : 'Добавьте первую личность через админ-панель'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPersons.map((person, index) => (
              <Card
                key={person.id}
                className="group cursor-pointer overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in hover:-translate-y-2"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedPerson(person)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={person.image_url}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    {person.category_color && person.category_name && (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xl backdrop-blur-sm"
                        style={{ backgroundColor: person.category_color }}
                      >
                        {person.category_name}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
                      {person.name}
                    </h3>
                    {person.telegram_username && (
                      <p className="text-xs text-primary font-medium mb-2">
                        {person.telegram_username}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {person.bio}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedPerson && (
        <div
          className="fixed inset-0 bg-background/98 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="max-w-5xl w-full bg-card border border-border rounded-3xl overflow-hidden animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-5 gap-0">
              <div className="md:col-span-2 relative aspect-[3/4] md:aspect-auto">
                <img
                  src={selectedPerson.image_url}
                  alt={selectedPerson.name}
                  className="w-full h-full object-cover"
                />
                {selectedPerson.category_color && selectedPerson.category_name && (
                  <div className="absolute top-6 left-6">
                    <div
                      className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-xl"
                      style={{ backgroundColor: selectedPerson.category_color }}
                    >
                      {selectedPerson.category_name}
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {selectedPerson.name}
                  </h2>
                  {selectedPerson.telegram_username && (
                    <a
                      href={`https://t.me/${selectedPerson.telegram_username.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 transition-colors"
                    >
                      <Icon name="Send" size={18} />
                      {selectedPerson.telegram_username}
                    </a>
                  )}
                  <p className="text-muted-foreground leading-relaxed text-lg mt-6 mb-6">
                    {selectedPerson.bio}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-3 w-fit">
                    <Icon name="Calendar" size={16} />
                    Добавлено: {new Date(selectedPerson.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-bold text-lg shadow-xl"
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
