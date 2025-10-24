-- Flyway migration script
-- Version: 1
-- Description: Creates the initial schema for the expense tracker application.

-- Table: merchants
-- Stores unique commercial entities to avoid repetition.
CREATE TABLE merchants (
    merchant_id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_name VARCHAR(255) NOT NULL UNIQUE
);

-- Table: categories
-- Stores expense categories for analysis and filtering.
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- Table: transactions
-- This is the central table that ties everything together.
-- Location data (city, country) is denormalized for simpler queries.
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    location VARCHAR(200) NOT NULL,
    category_id INT,
    amount VARCHAR(200) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_merchant
        FOREIGN KEY(merchant_id)
        REFERENCES merchants(merchant_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
);

-- Indexes for performance on foreign key columns
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);