-- Insert sample rewards data
INSERT INTO rewards (title, description, brand, value_rm, points_required, category, terms_conditions, stock_quantity) VALUES
-- Food & Beverage
('Food Voucher', 'Enjoy delicious meals with this food delivery voucher', 'Grab Food', 10.00, 100, 'food', 'Valid for 90 days from redemption. Cannot be combined with other offers.', 50),
('Fast Food Meal', 'Get your favorite burger meal', 'McDonald''s', 15.00, 150, 'food', 'Valid at participating outlets only. Not valid with other promotions.', 30),
('Coffee Voucher', 'Premium coffee and beverages', 'Starbucks', 20.00, 200, 'food', 'Valid for hot and cold beverages. Excludes merchandise.', 25),
('Local Cuisine', 'Authentic Malaysian food delivery', 'foodpanda', 12.00, 120, 'food', 'Minimum order may apply. Valid for selected restaurants.', 40),

-- Transport
('Ride Voucher', 'Convenient transportation around the city', 'Grab Ride', 8.00, 80, 'transport', 'Valid for GrabCar and GrabTaxi services. Subject to surge pricing.', 60),
('E-Wallet Top Up', 'Digital wallet credit for various payments', 'Touch ''n Go eWallet', 10.00, 100, 'transport', 'Credit will be added to your TNG eWallet account within 24 hours.', -1),
('Fuel Voucher', 'Petrol station fuel discount', 'Shell', 25.00, 250, 'transport', 'Valid at participating Shell stations. Cannot be exchanged for cash.', 20),
('Public Transport', 'LRT/MRT travel credit', 'RapidKL', 15.00, 150, 'transport', 'Valid for 30 days from activation. Non-transferable.', 35),

-- Shopping
('Online Shopping', 'Discount voucher for online purchases', 'Shopee', 15.00, 150, 'shopping', 'Minimum spend required. Valid for selected categories only.', 45),
('E-commerce Credit', 'Shopping credit for various products', 'Lazada', 20.00, 200, 'shopping', 'Cannot be used for certain restricted items. Check terms on platform.', 30),
('Department Store', 'Shopping voucher for fashion and lifestyle', 'AEON', 30.00, 300, 'shopping', 'Valid at AEON stores nationwide. Cannot be exchanged for cash.', 15),
('Electronics Store', 'Discount on gadgets and electronics', 'Harvey Norman', 50.00, 500, 'shopping', 'Valid for 6 months. Excludes Apple products and promotional items.', 10),

-- Entertainment
('Movie Tickets', 'Cinema experience voucher', 'GSC Cinemas', 18.00, 180, 'entertainment', 'Valid for regular 2D movies. Surcharge applies for premium formats.', 25),
('Music Streaming', '3-month premium subscription', 'Spotify Premium', 35.00, 350, 'entertainment', 'For new subscribers only. Auto-renewal can be cancelled anytime.', -1),
('Video Streaming', '1-month subscription', 'Netflix', 45.00, 450, 'entertainment', 'Valid for new accounts. Content varies by region.', -1),
('Gaming Credit', 'In-game currency and items', 'Steam Wallet', 25.00, 250, 'entertainment', 'Credit added to Steam account. Cannot be transferred or refunded.', 40),

-- Education
('Book Voucher', 'Educational and reference books', 'Popular Bookstore', 25.00, 250, 'education', 'Valid for books and stationery. Excludes magazines and newspapers.', 20),
('Online Course', 'Skill development and learning', 'Coursera', 80.00, 800, 'education', '1-month access to Coursera Plus. Certificate eligible courses included.', 15),
('Language Learning', '6-month premium access', 'Duolingo Plus', 40.00, 400, 'education', 'Ad-free learning with offline access. Progress tracking included.', -1),
('Stationery Set', 'Complete study materials package', 'MPH Bookstore', 20.00, 200, 'education', 'Includes notebooks, pens, and basic stationery items.', 30);

-- Update the updated_at timestamp for all records
UPDATE rewards SET updated_at = NOW();
