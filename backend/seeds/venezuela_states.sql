-- Seed: 24 estados de Venezuela con coordenadas centrales y zoom por defecto
-- Ejecutar en la BD recursosve DESPUÉS de que el backend haya creado la tabla via synchronize:true

INSERT INTO venezuela_states (nombre, codigo, lat, lng, zoom) VALUES
  ('Amazonas',        'VE-Z', 3.8510,   -65.9380,  7),
  ('Anzoátegui',      'VE-B', 8.9917,   -63.8578,  8),
  ('Apure',           'VE-C', 6.9000,   -68.5100,  7),
  ('Aragua',          'VE-D', 10.1225,  -67.5917,  9),
  ('Barinas',         'VE-E', 8.6231,   -70.2072,  8),
  ('Bolívar',         'VE-F', 7.8311,   -63.5517,  7),
  ('Carabobo',        'VE-G', 10.2442,  -67.9956,  9),
  ('Cojedes',         'VE-H', 9.3818,   -68.4032,  9),
  ('Delta Amacuro',   'VE-Y', 8.8819,   -61.1405,  8),
  ('Distrito Capital','VE-A', 10.4880,  -66.8791, 12),
  ('Falcón',          'VE-I', 11.1817,  -69.8600,  8),
  ('Guárico',         'VE-J', 8.7494,   -66.2355,  8),
  ('Lara',            'VE-K', 10.0647,  -69.3570,  9),
  ('Mérida',          'VE-L', 8.5933,   -71.1445,  9),
  ('Miranda',         'VE-M', 10.1614,  -66.4316,  9),
  ('Monagas',         'VE-N', 9.3354,   -63.0233,  8),
  ('Nueva Esparta',   'VE-O', 11.0006,  -63.9117,  10),
  ('Portuguesa',      'VE-P', 9.0939,   -69.0966,  9),
  ('Sucre',           'VE-R', 10.2550,  -62.6383,  8),
  ('Táchira',         'VE-S', 7.9143,   -72.3042,  9),
  ('Trujillo',        'VE-T', 9.3689,   -70.4267,  9),
  ('La Guaira',       'VE-X', 10.6010,  -66.9320, 12),
  ('Yaracuy',         'VE-U', 10.3394,  -68.8077,  9),
  ('Zulia',           'VE-V', 10.3894,  -71.7773,  8)
ON CONFLICT DO NOTHING;
