-- Базовая конфигурация приложения
INSERT INTO "public"."Application" ("id", "name", "displayName", "description", "isActive", "createdAt", "updatedAt")
VALUES (
  'etf-flow-default-app',
  'etf.flow',
  'ETF Flow Tracker',
  'Track ETF flows and get notifications about significant changes',
  true,
  NOW(),
  NOW()
) ON CONFLICT ("name") DO NOTHING;
