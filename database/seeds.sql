USE course_sharing;

INSERT INTO users (username, password_hash, email, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@course.com', 'admin', 'active'),
('teacher1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'teacher1@course.com', 'teacher', 'active'),
('student1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student1@course.com', 'student', 'active');

INSERT INTO categories (name, parent_id, sort_order) VALUES
('计算机', NULL, 1),
('数学', NULL, 2),
('英语', NULL, 3);

INSERT INTO categories (name, parent_id, sort_order) VALUES
('前端开发', 1, 1),
('后端开发', 1, 2),
('人工智能', 1, 3),
('高等数学', 2, 1),
('线性代数', 2, 2),
('商务英语', 3, 1),
('学术英语', 3, 2);

INSERT INTO tags (name) VALUES
('Vue'),
('React'),
('Python'),
('Java'),
('入门'),
('进阶'),
('实战');

INSERT INTO resources (title, description, file_path, file_type, file_size, uploader_id, category_id, view_count, download_count, status) VALUES
('Vue3入门教程', 'Vue3基础教程，适合初学者', '/uploads/vue3-intro.pdf', 'pdf', 1024000, 2, 4, 120, 45, 'published'),
('Python机器学习实战', '使用Python进行机器学习的实战课程', '/uploads/ml-python.pdf', 'pdf', 2048000, 2, 6, 85, 30, 'published'),
('高等数学笔记', '高等数学重点知识整理', '/uploads/math-notes.pdf', 'pdf', 512000, 2, 7, 200, 80, 'published');

INSERT INTO resource_tags (resource_id, tag_id) VALUES
(1, 1),
(1, 5),
(2, 3),
(2, 7),
(3, 5);

INSERT INTO favorites (user_id, resource_id) VALUES
(3, 1),
(3, 2);

INSERT INTO access_logs (user_id, resource_id, action, ip_address) VALUES
(3, 1, 'view', '127.0.0.1'),
(3, 1, 'download', '127.0.0.1'),
(3, 2, 'view', '127.0.0.1'),
(3, 3, 'view', '127.0.0.1');
