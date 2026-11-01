-- Новые подкатегории: таунхаусы и назначение участков

UPDATE listings SET data = json_set(data, '$.type', 'townhouse'), updated_at = datetime('now')
WHERE id IN ('hincesti-townhouses', 'hincesti-townhouse');

UPDATE listings SET data = json_set(data, '$.landUse', 'building'), updated_at = datetime('now')
WHERE id IN (
  'ad-104276527', 'ad-105736213', 'ad-105667430', 'ad-105186349', 'ad-105738246', 'ad-105434516',
  'ad-105542407', 'ad-103666839', 'ad-104714821', 'ad-105515940', 'ad-104776867', 'ad-105039028',
  'ad-105577695', 'ad-105464796', 'ad-105012776', 'ad-104705630',
  'land-ivancea', 'land-telecentru', 'land-tohatin', 'land-bostancea', 'land-astercon',
  'dumbrava-plot', 'dumbrava-garden', 'land-danceni', 'land-sculeanca'
);

UPDATE listings SET data = json_set(data, '$.landUse', 'agricultural'), updated_at = datetime('now')
WHERE id IN (
  'ad-105465017', 'ad-105548073', 'ad-105703237', 'ad-104826794', 'ad-104201238', 'ad-104396312',
  'ad-103899220', 'ad-105572751', 'ad-105039055', 'ad-103919761', 'ad-105545802', 'ad-103907777',
  'ad-105578717', 'ad-103688415', 'ad-103638025',
  'land-peresecina', 'hazelnut-farm', 'walnut-plantation', 'vineyard', 'land-airport', 'land-gratiesti'
);

UPDATE listings SET data = json_set(data, '$.landUse', 'industrial'), updated_at = datetime('now')
WHERE id IN ('ad-104610412', 'ad-105737668', 'ad-104621640', 'land-buiucani');
