INSERT INTO public.admins ("id", "username", "password", "email", "firstName", "lastName", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-flutter',
  'flutter',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- пароль: 123
  'flutter@example.com',
  'Flutter',
  'Admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("username") DO UPDATE SET
  "password" = EXCLUDED."password",
  "email" = EXCLUDED."email",
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();
