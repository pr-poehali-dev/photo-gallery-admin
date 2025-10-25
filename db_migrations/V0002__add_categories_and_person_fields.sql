-- Добавляем таблицу категорий
CREATE TABLE IF NOT EXISTS t_p61347388_photo_gallery_admin.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем стандартные категории в стиле tgfame.fun
INSERT INTO t_p61347388_photo_gallery_admin.categories (name, color) VALUES
    ('Фейм', '#10b981'),
    ('Слабый фейм', '#f59e0b'),
    ('Скамер', '#ef4444'),
    ('Главный фейм', '#8b5cf6'),
    ('Новичок', '#6366f1'),
    ('Легенда', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Добавляем поле category_id к gallery_items
ALTER TABLE t_p61347388_photo_gallery_admin.gallery_items
    ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES t_p61347388_photo_gallery_admin.categories(id);

-- Переименовываем поля для более понятного формата личностей
ALTER TABLE t_p61347388_photo_gallery_admin.gallery_items
    RENAME COLUMN title TO name;

ALTER TABLE t_p61347388_photo_gallery_admin.gallery_items
    RENAME COLUMN description TO bio;

-- Добавляем поле для Telegram username (опционально)
ALTER TABLE t_p61347388_photo_gallery_admin.gallery_items
    ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255);