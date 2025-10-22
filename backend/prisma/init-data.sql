INSERT INTO public.applications ("id","name","displayName","description","isActive","createdAt","updatedAt")
VALUES (
  'etf-flow-default-app',
  'etf.flow',
  'ETF Flow Tracker',
  'Track ETF flows and get notifications about significant changes',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT ("name") DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  "description" = EXCLUDED."description",
  "isActive"   = EXCLUDED."isActive",
  "updatedAt"  = NOW();