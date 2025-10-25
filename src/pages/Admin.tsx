import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import ImagePicker from '@/components/ImagePicker';

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
  telegram_username?: string;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [persons, setPersons] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPerson, setNewPerson] = useState({
    image_url: '',
    name: '',
    bio: '',
    category_id: 1,
    telegram_username: ''
  });
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    await fetchCategories();
    await fetchPersons();
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a?type=categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPersons = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a');
      const data = await response.json();
      setPersons(data.items || []);
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

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
        fetchData();
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

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPerson)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех!',
          description: 'Личность успешно добавлена'
        });
        setNewPerson({
          image_url: '',
          name: '',
          bio: '',
          category_id: 1,
          telegram_username: ''
        });
        fetchPersons();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось добавить личность',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при добавлении',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту личность?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/9030f112-3631-4e10-9524-bce45dd0ff5a?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Удалено',
          description: 'Личность успешно удалена'
        });
        fetchPersons();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить личность',
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

  const getCategoryById = (id: number) => {
    return categories.find(c => c.id === id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-border bg-card/80 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Icon name="Shield" size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Админ-панель
            </h1>
            <p className="text-muted-foreground mt-2">
              Управление личностями TG Fame
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Логин</label>
              <Input
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Пароль</label>
              <Input
                type="password"
                placeholder="Введите пароль"
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Users" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">TG Fame Admin</h1>
                <p className="text-sm text-muted-foreground">Управление личностями</p>
              </div>
            </div>
            <div className="flex gap-3">
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
          <Card className="p-6 border-border bg-card">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="UserPlus" size={24} className="text-primary" />
              Добавить личность
            </h2>
            <form onSubmit={handleAddPerson} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Фото</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="URL фото или загрузите с устройства"
                    value={newPerson.image_url}
                    onChange={(e) => setNewPerson({ ...newPerson, image_url: e.target.value })}
                    className="bg-secondary border-border flex-1"
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    variant="outline"
                    className="px-4"
                    disabled={uploading}
                  >
                    <Icon name="Images" size={18} />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    variant="outline"
                    className="px-4"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon name="Upload" size={18} />
                    )}
                  </Button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith('image/')) {
                      toast({
                        title: 'Ошибка',
                        description: 'Пожалуйста, выберите изображение',
                        variant: 'destructive'
                      });
                      return;
                    }

                    if (file.size > 10 * 1024 * 1024) {
                      toast({
                        title: 'Ошибка',
                        description: 'Файл слишком большой (макс. 10 МБ)',
                        variant: 'destructive'
                      });
                      return;
                    }

                    setUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append('image', file);

                      const response = await fetch('https://functions.poehali.dev/d3edc9aa-f2d6-4fdc-9de0-d42e6bc13784', {
                        method: 'POST',
                        body: formData
                      });

                      const data = await response.json();

                      if (data.url) {
                        setNewPerson({ ...newPerson, image_url: data.url });
                        toast({
                          title: 'Успех!',
                          description: 'Фото успешно загружено'
                        });
                      } else {
                        toast({
                          title: 'Ошибка',
                          description: 'Не удалось загрузить фото',
                          variant: 'destructive'
                        });
                      }
                    } catch (error) {
                      toast({
                        title: 'Ошибка',
                        description: 'Произошла ошибка при загрузке',
                        variant: 'destructive'
                      });
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
                {newPerson.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border">
                    <img
                      src={newPerson.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Имя</label>
                <Input
                  type="text"
                  placeholder="Введите имя личности"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <select
                  value={newPerson.category_id}
                  onChange={(e) => setNewPerson({ ...newPerson, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Telegram Username</label>
                <Input
                  type="text"
                  placeholder="@username (опционально)"
                  value={newPerson.telegram_username}
                  onChange={(e) => setNewPerson({ ...newPerson, telegram_username: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Биография</label>
                <Textarea
                  placeholder="Расскажите о личности..."
                  value={newPerson.bio}
                  onChange={(e) => setNewPerson({ ...newPerson, bio: e.target.value })}
                  className="bg-secondary border-border min-h-32"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Добавление...' : 'Добавить личность'}
              </Button>
            </form>
          </Card>

          <Card className="p-6 border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Info" size={24} className="text-primary" />
              Категории
            </h2>
            <div className="space-y-4">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="p-4 rounded-lg bg-card border border-border flex items-center gap-3"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-card rounded-lg border border-border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-primary" />
                Как это работает?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Выберите или добавьте фото личности</li>
                <li>• Укажите имя и категорию</li>
                <li>• Добавьте биографию и Telegram</li>
                <li>• Личность появится на главной странице</li>
              </ul>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border bg-card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon name="Users" size={24} className="text-primary" />
            Все личности ({persons.length})
          </h2>
          {persons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="UserX" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет добавленных личностей</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {persons.map((person) => {
                const category = getCategoryById(person.category_id);
                return (
                  <div
                    key={person.id}
                    className="group relative border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 bg-secondary/30"
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={person.image_url}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        {category && (
                          <div
                            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{person.name}</h3>
                      {person.telegram_username && (
                        <p className="text-sm text-primary mb-2">
                          {person.telegram_username}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {person.bio}
                      </p>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="w-full px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Icon name="Trash2" size={16} />
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>

      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(url) => setNewPerson({ ...newPerson, image_url: url })}
      />
    </div>
  );
};

export default Admin;