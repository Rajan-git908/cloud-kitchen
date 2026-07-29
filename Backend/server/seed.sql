-- Run this file in MySQL to create the database and seed sample data
CREATE DATABASE IF NOT EXISTS food_apps CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE food_apps;

-- users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100),
  title VARCHAR(200)
);

-- items
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255),
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Oitem_id int ,
  user_id INT NULL,   -- registered user, can be NULL for guest
  guest_name VARCHAR(255),
  guest_phone VARCHAR(20),
  address VARCHAR(500) NOT NULL,   -- ✅ delivery address
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','approved','dispatched','delivered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  foreign key (Oitem_id) references order_items(Id) on delete set null
);
 

-- order items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  item_id INT,
  qty INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
);

-- seed categories
INSERT INTO categories (slug, title) VALUES
('breakfast', 'Breakfast & Light Bites'),
('chicken', 'Chicken Specials'),
('snacks', 'Street Snacks & Chaats')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

-- seed items (matches frontend sample)
INSERT INTO items (category_id, name, price, image_url) VALUES
((SELECT id FROM categories WHERE slug='breakfast'), 'Berries', 59, '/images/berries.png'),
((SELECT id FROM categories WHERE slug='breakfast'), 'Cottage Cheese', 79, '/images/cottage.png'),
((SELECT id FROM categories WHERE slug='breakfast'), 'Green Tea', 89, '/images/green_tea.jpg'),
((SELECT id FROM categories WHERE slug='snacks'), 'Panipuri', 59, '/images/panipuri.jpg'),
((SELECT id FROM categories WHERE slug='snacks'), 'Chaat', 99, '/images/chaat.jpg'),
((SELECT id FROM categories WHERE slug='chicken'), 'Roast Chicken', 299, '/images/roast_chicken.jpg')
ON DUPLICATE KEY UPDATE name=VALUES(name);
