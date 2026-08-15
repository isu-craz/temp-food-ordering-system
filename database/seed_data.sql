-- ============================================================================
-- SPICE AVENUE - MASTER SEED DATA SCRIPT (MySQL 8.x)
-- Default Password for all seeded accounts: Password123!
-- (BCrypt hash: $2a$10$7v1bJ4N1.H8qN.3Yq7qV0O2ZzX6m5J1eT4W9Y1A0B2C3D4E5F6G7H)
-- ============================================================================

USE `spice_avenue_db`;

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (All 6 Roles)
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone_number`, `role`, `rider_status`) VALUES
-- Admin & Ops Manager (Member 1)
(1, 'System Administrator', 'admin@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110001', 'ADMIN', 'OFFLINE'),
(2, 'Operations Manager', 'ops@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110002', 'OPS_MANAGER', 'OFFLINE'),

-- Branch Managers (Member 1, 2, 4)
(3, 'Colombo Branch Manager', 'manager.colombo@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110003', 'BRANCH_MANAGER', 'OFFLINE'),
(4, 'Negombo Branch Manager', 'manager.negombo@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110004', 'BRANCH_MANAGER', 'OFFLINE'),

-- Delivery Riders (Member 5)
(5, 'Kamal Perera (Rider)', 'rider.kamal@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110005', 'RIDER', 'AVAILABLE'),
(6, 'Nimal Silva (Rider)', 'rider.nimal@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110006', 'RIDER', 'AVAILABLE'),
(7, 'Sunil Fernando (Rider)', 'rider.sunil@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110007', 'RIDER', 'BUSY'),

-- Customer Service Supervisor (Member 6)
(8, 'CS Supervisor Ann', 'supervisor@spiceavenue.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110008', 'SUPERVISOR', 'OFFLINE'),

-- Customers (Member 3 & 6)
(9, 'John Doe (Customer)', 'customer.john@gmail.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110009', 'CUSTOMER', 'OFFLINE'),
(10, 'Jane Smith (Customer)', 'customer.jane@gmail.com', '$2a$10$0zR0KzJ2D3/gPcmx46M3lOmbZ9b4c0oG2A1w0t7H2aWj4d1v5k4aW', '0771110010', 'CUSTOMER', 'OFFLINE');

-- ----------------------------------------------------------------------------
-- 2. SEED BRANCHES (Member 1)
-- ----------------------------------------------------------------------------
INSERT INTO `branches` (`branch_id`, `branch_name`, `street_address`, `contact_number`, `email`, `opening_time`, `closing_time`, `manager_id`, `status`) VALUES
(1, 'Spice Avenue - Colombo Central', 'No. 120, Galle Road, Colombo 03', '0112345678', 'colombo@spiceavenue.com', '08:00:00', '23:00:00', 3, 'ACTIVE'),
(2, 'Spice Avenue - Negombo Coastal', 'No. 45, Beach Road, Negombo', '0312345678', 'negombo@spiceavenue.com', '09:00:00', '22:30:00', 4, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 3. SEED DELIVERY AREAS (Member 1)
-- ----------------------------------------------------------------------------
INSERT INTO `delivery_areas` (`area_id`, `branch_id`, `area_name`, `delivery_fee`, `status`) VALUES
-- Colombo Areas
(1, 1, 'Colombo 01 (Fort)', 250.00, 'ACTIVE'),
(2, 1, 'Colombo 03 (Kollupitiya)', 200.00, 'ACTIVE'),
(3, 1, 'Colombo 07 (Cinnamon Gardens)', 220.00, 'ACTIVE'),
-- Negombo Areas
(4, 2, 'Negombo Town', 200.00, 'ACTIVE'),
(5, 2, 'Kurana', 220.00, 'ACTIVE'),
(6, 2, 'Katunayake', 300.00, 'ACTIVE'),
(7, 2, 'Seeduwa', 350.00, 'ACTIVE'),
(8, 2, 'Ja-Ela', 400.00, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 4. SEED FOOD CATEGORIES (Member 2)
-- ----------------------------------------------------------------------------
INSERT INTO `categories` (`category_id`, `branch_id`, `category_name`, `description`, `status`) VALUES
(1, 1, 'Pizza & Flatbreads', 'Freshly baked artisanal stone oven pizzas', 'ACTIVE'),
(2, 1, 'Gourmet Burgers', 'Juicy grilled patties with brioche buns', 'ACTIVE'),
(3, 1, 'Rice & Wok', 'Flavorful fried rice and noodles dishes', 'ACTIVE'),
(4, 1, 'Beverages & Smoothies', 'Fresh juices, iced teas, and fizzy drinks', 'ACTIVE'),
(5, 1, 'Desserts', 'Sweet treats and decadent cakes', 'ACTIVE'),

(6, 2, 'Pizza & Flatbreads', 'Stone-baked coastal pizzas', 'ACTIVE'),
(7, 2, 'Seafood & Grills', 'Catch of the day grilled specials', 'ACTIVE'),
(8, 2, 'Beverages', 'Refreshing cold drinks', 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 5. SEED MENU ITEMS (Member 2)
-- ----------------------------------------------------------------------------
INSERT INTO `menu_items` (`item_id`, `branch_id`, `category_id`, `food_name`, `description`, `base_price`, `image_url`, `is_available`, `status`) VALUES
(1, 1, 1, 'Spicy Devilled Chicken Pizza', 'Mozzarella, spicy Sri Lankan devilled chicken, capsicum, and onions.', 1800.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', TRUE, 'ACTIVE'),
(2, 1, 1, 'Classic Margherita', 'Fresh tomato sauce, buffalo mozzarella, and fragrant basil leaves.', 1500.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500', TRUE, 'ACTIVE'),
(3, 1, 2, 'Double Beef Supreme Burger', 'Two flame-grilled beef patties with cheddar cheese and caramelized onion sauce.', 1650.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', TRUE, 'ACTIVE'),
(4, 1, 3, 'Signature Nasi Goreng Bowl', 'Indonesian style spicy fried rice served with chicken satay, fried egg, and prawn crackers.', 1400.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500', TRUE, 'ACTIVE'),
(5, 1, 4, 'Tropical Mango & Passion Smoothie', 'Blended ripe mangoes and passion fruit pulp with crushed ice.', 650.00, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500', TRUE, 'ACTIVE'),
(6, 1, 5, 'Molten Chocolate Lava Cake', 'Warm dark chocolate cake with a gooey center served with vanilla gelato.', 850.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', TRUE, 'ACTIVE'),

(7, 2, 6, 'Negombo Lagoon Prawn Pizza', 'Fresh lagoon prawns with chili flakes, mozzarella, and garlic butter.', 2200.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', TRUE, 'ACTIVE'),
(8, 2, 7, 'Grilled Jumbo Butter Garlic Fish', 'Catch of the day grilled to perfection with herb potato wedges.', 1950.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', TRUE, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 6. SEED MENU VARIATIONS (Member 2)
-- ----------------------------------------------------------------------------
INSERT INTO `menu_variations` (`variation_id`, `item_id`, `variation_name`, `additional_price`, `status`) VALUES
-- Variations for Spicy Devilled Chicken Pizza
(1, 1, 'Small (6-inch)', 0.00, 'ACTIVE'),
(2, 1, 'Medium (9-inch)', 600.00, 'ACTIVE'),
(3, 1, 'Large (12-inch)', 1200.00, 'ACTIVE'),

-- Variations for Classic Margherita
(4, 2, 'Small (6-inch)', 0.00, 'ACTIVE'),
(5, 2, 'Medium (9-inch)', 500.00, 'ACTIVE'),
(6, 2, 'Large (12-inch)', 1000.00, 'ACTIVE'),

-- Variations for Smoothie
(7, 5, 'Regular (350ml)', 0.00, 'ACTIVE'),
(8, 5, 'Large (500ml)', 250.00, 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 7. SEED CUSTOMER ADDRESSES (Member 3)
-- ----------------------------------------------------------------------------
INSERT INTO `customer_addresses` (`address_id`, `customer_id`, `label`, `house_number`, `street`, `area_id`, `is_default`) VALUES
(1, 9, 'Home', 'No. 24/B', 'Duplication Road, Kollupitiya', 2, TRUE),
(2, 9, 'Office', 'Level 14, World Trade Center', 'Echelon Square, Fort', 1, FALSE),
(3, 10, 'Villa', 'No. 88', 'Beach Road, Negombo', 4, TRUE);

-- ----------------------------------------------------------------------------
-- 8. SEED ORDERS (Member 3, 4, 5, 6)
-- ----------------------------------------------------------------------------
INSERT INTO `orders` (`order_id`, `order_number`, `customer_id`, `branch_id`, `order_type`, `status`, `subtotal`, `delivery_fee`, `total_amount`, `payment_method`, `delivery_address_id`, `estimated_prep_minutes`, `created_at`) VALUES
-- Completed Delivery Order for John
(1, 'ORD-20260815-001', 9, 1, 'DELIVERY', 'DELIVERED', 2400.00, 200.00, 2600.00, 'CARD', 1, 25, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Completed Pickup Order for Jane
(2, 'ORD-20260815-002', 10, 1, 'PICKUP', 'PICKED_UP', 1500.00, 0.00, 1500.00, 'CASH_ON_DELIVERY', NULL, 15, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- In-progress Delivery Order
(3, 'ORD-20260815-003', 9, 1, 'DELIVERY', 'OUT_FOR_DELIVERY', 1650.00, 200.00, 1850.00, 'CARD', 1, 20, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Newly placed Pending Order
(4, 'ORD-20260815-004', 10, 1, 'DELIVERY', 'PENDING', 2050.00, 220.00, 2270.00, 'CASH_ON_DELIVERY', 3, NULL, NOW());

-- ----------------------------------------------------------------------------
-- 9. SEED ORDER ITEMS (Member 3)
-- ----------------------------------------------------------------------------
INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `variation_id`, `item_name`, `variation_name`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 1, 2, 'Spicy Devilled Chicken Pizza', 'Medium (9-inch)', 1, 2400.00, 2400.00),
(2, 2, 2, 4, 'Classic Margherita', 'Small (6-inch)', 1, 1500.00, 1500.00),
(3, 3, 3, NULL, 'Double Beef Supreme Burger', NULL, 1, 1650.00, 1650.00),
(4, 4, 4, NULL, 'Signature Nasi Goreng Bowl', NULL, 1, 1400.00, 1400.00),
(5, 4, 5, 7, 'Tropical Mango & Passion Smoothie', 'Regular (350ml)', 1, 650.00, 650.00);

-- ----------------------------------------------------------------------------
-- 10. SEED DELIVERIES (Member 5)
-- ----------------------------------------------------------------------------
INSERT INTO `deliveries` (`delivery_id`, `order_id`, `rider_id`, `status`, `assigned_at`, `accepted_at`, `out_for_delivery_at`, `delivered_at`) VALUES
(1, 1, 5, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 110 MINUTE), DATE_SUB(NOW(), INTERVAL 105 MINUTE), DATE_SUB(NOW(), INTERVAL 80 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(2, 3, 7, 'OUT_FOR_DELIVERY', DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL);

-- ----------------------------------------------------------------------------
-- 11. SEED COMPLAINTS (Member 6)
-- ----------------------------------------------------------------------------
INSERT INTO `complaints` (`complaint_id`, `order_id`, `customer_id`, `category`, `description`, `image_url`, `status`, `resolution_notes`, `resolved_by`, `resolved_at`, `created_at`) VALUES
(1, 1, 9, 'Packaging Damaged', 'The pizza box corner was crushed during transit causing cheese to stick to top lid.', NULL, 'RESOLVED', 'Provided customer with a 20% discount coupon code for their next meal.', 8, NOW(), DATE_SUB(NOW(), INTERVAL 40 MINUTE));

-- ----------------------------------------------------------------------------
-- 12. SEED REVIEWS (Member 6)
-- ----------------------------------------------------------------------------
INSERT INTO `reviews` (`review_id`, `order_id`, `customer_id`, `rating`, `comment`, `review_date`) VALUES
(1, 1, 9, 4, 'Food tasted great and was hot upon arrival despite slight box damage.', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(2, 2, 10, 5, 'Best stone-baked Margherita in town! Crust was exceptionally crispy.', DATE_SUB(NOW(), INTERVAL 20 MINUTE));
