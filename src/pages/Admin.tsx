import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface GalleryItem {
  id: number;
  image_url: string;
  title: string;
  description: string;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    image_url: '',
    title: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchGalleryItems();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/043fced9-bae9-4e47-8771-992e6067e0c0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        fetchGalleryItems();
        toast({
          title: 'Добро пожаловать!',
          description: 'Вы успешно вошли в админ-панель'
        });
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Новый элемент добавлен в галерею'
        });
        setNewItem({ image_url: '', title: '', description: '' });
        fetchGalleryItems();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить элемент',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Удалено',
          description: 'Элемент успешно удалён из галереи'
        });
        fetchGalleryItems();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить элемент',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-border bg-card animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Lock" size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Войдите для доступа к админ-панели</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Вернуться на главную
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <div className="flex gap-4">
              <a
                href="/"
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Icon name="Home" size={18} />
                Главная
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Icon name="LogOut" size={18} />
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 border-border bg-card animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="Plus" size={24} className="text-primary" />
              Добавить новый элемент
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">URL изображения</label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  className="bg-secondary border-border"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Название</label>
                <Input
                  type="text"
                  placeholder="Введите название"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="bg-secondary border-border"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Textarea
                  placeholder="Введите описание"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="bg-secondary border-border min-h-32"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Добавление...' : 'Добавить элемент'}
              </Button>
            </form>
          </Card>

          <Card className="p-6 border-border bg-card animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="Info" size={24} className="text-primary" />
              Как использовать
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Добавьте изображение</h3>
                  <p>Вставьте URL изображения в первое поле</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Заполните информацию</h3>
                  <p>Добавьте название и описание к элементу</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Опубликуйте</h3>
                  <p>Нажмите кнопку и элемент появится в галерее</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border bg-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon name="Image" size={24} className="text-primary" />
            Текущие элементы ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="ImageOff" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет элементов в галерее</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 bg-secondary/50">
                    <h3 className="font-semibold mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-full px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm"
                    >
                      <Icon name="Trash2" size={16} />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Admin;
