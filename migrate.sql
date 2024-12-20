-- Create the 'users' table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,          -- Auto-incrementing ID
  name VARCHAR(100) NOT NULL,     -- Name column
  email VARCHAR(100) UNIQUE,      -- Email column
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for record creation
);

-- Optional: Insert initial data
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');
