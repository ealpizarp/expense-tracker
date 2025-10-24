-- Add foreign key constraint for user_id in transactions table
ALTER TABLE transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL;
