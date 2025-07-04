-- Insert sample rewards/vouchers
INSERT INTO rewards (title, description, brand, value_rm, points_required, category, terms_conditions, stock_quantity) VALUES
-- Food & Beverage
('Grab Food Voucher', 'RM10 off your next food delivery', 'Grab', 10.00, 100, 'food', 'Valid for 90 days. Minimum order RM15. One-time use only.', 50),
('McDonald''s Voucher', 'RM15 off your McDonald''s order', 'McDonald''s', 15.00, 150, 'food', 'Valid at participating outlets. Cannot be combined with other offers.', 30),
('Starbucks Voucher', 'RM20 off your Starbucks purchase', 'Starbucks', 20.00, 200, 'food', 'Valid at all Starbucks outlets in Malaysia. Excludes merchandise.', 25),
('KFC Voucher', 'RM12 off your KFC meal', 'KFC', 12.00, 120, 'food', 'Valid for dine-in and takeaway. Minimum spend RM20.', 40),

-- Transport
('Grab Ride Voucher', 'RM8 off your next ride', 'Grab', 8.00, 80, 'transport', 'Valid for GrabCar and GrabTaxi. Maximum 2 uses per user.', 100),
('Touch ''n Go eWallet', 'RM10 top-up credit', 'Touch ''n Go', 10.00, 100, 'transport', 'Credit will be added to your TnG eWallet within 24 hours.', -1),
('Fuel Voucher', 'RM25 petrol voucher', 'Shell', 25.00, 250, 'transport', 'Valid at participating Shell stations. Cannot be exchanged for cash.', 20),

-- Shopping
('Shopee Voucher', 'RM15 off your purchase', 'Shopee', 15.00, 150, 'shopping', 'Minimum spend RM50. Valid for 30 days.', 60),
('Lazada Voucher', 'RM20 off your order', 'Lazada', 20.00, 200, 'shopping', 'Applicable to selected items only. Check terms on app.', 45),
('AEON Voucher', 'RM30 shopping voucher', 'AEON', 30.00, 300, 'shopping', 'Valid at all AEON stores nationwide. Cannot be used for gift cards.', 15),

-- Entertainment
('Cinema Voucher', 'Free movie ticket', 'GSC', 18.00, 180, 'entertainment', 'Valid for 2D movies only. Surcharge applies for premium halls.', 35),
('Spotify Premium', '1 month subscription', 'Spotify', 17.90, 179, 'entertainment', 'For new subscribers only. Auto-renewal can be cancelled anytime.', 50),
('Netflix Voucher', 'RM30 credit', 'Netflix', 30.00, 300, 'entertainment', 'Credit applied to your Netflix account. Valid for 12 months.', 25),

-- Education
('Book Voucher', 'RM25 off books', 'Popular Bookstore', 25.00, 250, 'education', 'Valid for educational books and stationery. Excludes magazines.', 30),
('Online Course', 'RM50 course credit', 'Udemy', 50.00, 500, 'education', 'Choose from thousands of courses. Credit valid for 6 months.', 20),
('Stationery Voucher', 'RM15 off supplies', 'Mr. DIY', 15.00, 150, 'education', 'Valid for stationery and office supplies only.', 40);
