CREATE TABLE IF NOT EXISTS resource_files (
  resource_id INTEGER PRIMARY KEY,
  file_data TEXT NOT NULL,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);
