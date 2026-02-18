-- Seed data for Homebuyer's Handbook
-- Run after schema.sql; uses default schema (public)

-- Seed users (passwords are placeholder hashes; replace in real app)
INSERT INTO "Users" ("Email", "Password", "Premium", "Zipcode", "UserRole")
VALUES
  ('alice@example.com', '$2a$10$placeholder_hash_1', FALSE, 90210, 'U'),
  ('bob@example.com', '$2a$10$placeholder_hash_2', TRUE, 10001, 'U'),
  ('admin@example.com', '$2a$10$placeholder_hash_admin', TRUE, 60601, 'A')
ON CONFLICT ("Email") DO NOTHING;
