-- Добавляем счётчик просмотров к личностям
ALTER TABLE t_p61347388_photo_gallery_admin.gallery_items
    ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;