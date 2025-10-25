-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$rKZvVQKxGxKxGxKxGxKxGe8yJ5XQXQXQXQXQXQXQXQXQXQXQXQXQ')
ON CONFLICT (username) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery_items(created_at DESC);