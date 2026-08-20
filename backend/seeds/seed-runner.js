const { Client } = require('pg');

const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Megaman624891*',
  database: process.env.POSTGRES_DB || 'recursosve_db',
};

const states = [
  { id: 1, nombre: 'Amazonas', codigo: 'VE-Z', lat: 3.8510, lng: -65.9380, zoom: 9 },
  { id: 2, nombre: 'Anzoátegui', codigo: 'VE-B', lat: 8.9917, lng: -63.8578, zoom: 10 },
  { id: 3, nombre: 'Apure', codigo: 'VE-C', lat: 6.9000, lng: -68.5100, zoom: 10 },
  { id: 4, nombre: 'Aragua', codigo: 'VE-D', lat: 10.1225, lng: -67.5917, zoom: 11 },
  { id: 5, nombre: 'Barinas', codigo: 'VE-E', lat: 8.6231, lng: -70.2072, zoom: 10 },
  { id: 6, nombre: 'Bolívar', codigo: 'VE-F', lat: 7.8311, lng: -63.5517, zoom: 9 },
  { id: 7, nombre: 'Carabobo', codigo: 'VE-G', lat: 10.2442, lng: -67.9956, zoom: 11 },
  { id: 8, nombre: 'Cojedes', codigo: 'VE-H', lat: 9.3818, lng: -68.4032, zoom: 11 },
  { id: 9, nombre: 'Delta Amacuro', codigo: 'VE-Y', lat: 8.8819, lng: -61.1405, zoom: 10 },
  { id: 10, nombre: 'Distrito Capital', codigo: 'VE-A', lat: 10.4880, lng: -66.8791, zoom: 13 },
  { id: 11, nombre: 'Falcón', codigo: 'VE-I', lat: 11.1817, lng: -69.8600, zoom: 10 },
  { id: 12, nombre: 'Guárico', codigo: 'VE-J', lat: 8.7494, lng: -66.2355, zoom: 10 },
  { id: 13, nombre: 'Lara', codigo: 'VE-K', lat: 10.0647, lng: -69.3570, zoom: 11 },
  { id: 14, nombre: 'Mérida', codigo: 'VE-L', lat: 8.5933, lng: -71.1445, zoom: 11 },
  { id: 15, nombre: 'Miranda', codigo: 'VE-M', lat: 10.1614, lng: -66.4316, zoom: 11 },
  { id: 16, nombre: 'Monagas', codigo: 'VE-N', lat: 9.3354, lng: -63.0233, zoom: 10 },
  { id: 17, nombre: 'Nueva Esparta', codigo: 'VE-O', lat: 11.0006, lng: -63.9117, zoom: 12 },
  { id: 18, nombre: 'Portuguesa', codigo: 'VE-P', lat: 9.0939, lng: -69.0966, zoom: 11 },
  { id: 19, nombre: 'Sucre', codigo: 'VE-R', lat: 10.2550, lng: -62.6383, zoom: 10 },
  { id: 20, nombre: 'Táchira', codigo: 'VE-S', lat: 7.9143, lng: -72.3042, zoom: 11 },
  { id: 21, nombre: 'Trujillo', codigo: 'VE-T', lat: 9.3689, lng: -70.4267, zoom: 11 },
  { id: 22, nombre: 'La Guaira', codigo: 'VE-X', lat: 10.6010, lng: -66.9320, zoom: 13 },
  { id: 23, nombre: 'Yaracuy', codigo: 'VE-U', lat: 10.3394, lng: -68.8077, zoom: 11 },
  { id: 24, nombre: 'Zulia', codigo: 'VE-V', lat: 10.3894, lng: -71.7773, zoom: 10 },
];

const disasterTypes = [
  { code: 'terremoto', nombre: 'Terremoto / Sismo', color: '#EF4444', fillColor: '#FEE2E2', bgBadge: '#FEE2E2', textBadge: '#991B1B', icon: 'Activity' },
  { code: 'inundacion', nombre: 'Inundación', color: '#3B82F6', fillColor: '#DBEAFE', bgBadge: '#DBEAFE', textBadge: '#1E40AF', icon: 'CloudRain' },
  { code: 'deslave', nombre: 'Deslave', color: '#D97706', fillColor: '#FEF3C7', bgBadge: '#FEF3C7', textBadge: '#92400E', icon: 'Mountain' },
  { code: 'huracan', nombre: 'Huracán / Tormenta', color: '#8B5CF6', fillColor: '#EDE9FE', bgBadge: '#EDE9FE', textBadge: '#5B21B6', icon: 'Wind' },
  { code: 'incendio', nombre: 'Incendio Forestal', color: '#F97316', fillColor: '#FFEDD5', bgBadge: '#FFEDD5', textBadge: '#9A3412', icon: 'Flame' },
  { code: 'sequia', nombre: 'Sequía Extrema', color: '#EAB308', fillColor: '#FEF9C3', bgBadge: '#FEF9C3', textBadge: '#854D0E', icon: 'Sun' },
];

async function seed() {
  console.log('Connecting to PostgreSQL database:', config.database, 'at', config.host);
  const client = new Client(config);
  await client.connect();

  try {
    await client.query('BEGIN');

    // 0. Ensure tables exist
    console.log('Ensuring tables exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS venezuela_states (
        id INT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo VARCHAR(10) NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        zoom INT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS disaster_types (
        code VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        color VARCHAR(50) NOT NULL,
        "fillColor" VARCHAR(50) NOT NULL,
        "bgBadge" VARCHAR(50) NOT NULL,
        "textBadge" VARCHAR(50) NOT NULL,
        icon VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS disaster_zones (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        "radioMetros" INT NOT NULL,
        "estadoId" INT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS refugee_camps (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        poblacion INT NOT NULL,
        familias INT NOT NULL,
        capacidad INT NOT NULL,
        coordinador VARCHAR(255) NOT NULL,
        "estadoId" INT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS collection_centers (
        id VARCHAR(100) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        "stockInfo" VARCHAR(255) NOT NULL,
        contacto VARCHAR(255) NOT NULL,
        "estadoId" INT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS need_reports (
        id VARCHAR(100) PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        zona JSONB NOT NULL,
        recurso JSONB NOT NULL,
        "metadataUrgencia" JSONB NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'SIN_COBERTURA',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "resolvedAt" TIMESTAMP
      );
    `);

    // 1. Estados de Venezuela
    console.log('Seeding venezuela_states...');
    for (const st of states) {
      await client.query(
        `INSERT INTO venezuela_states (id, nombre, codigo, lat, lng, zoom)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, lat = EXCLUDED.lat, lng = EXCLUDED.lng`,
        [st.id, st.nombre, st.codigo, st.lat, st.lng, st.zoom]
      );
    }

    // 2. Tipos de Desastres
    console.log('Seeding disaster_types...');
    for (const dt of disasterTypes) {
      await client.query(
        `INSERT INTO disaster_types (code, nombre, color, "fillColor", "bgBadge", "textBadge", icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (code) DO UPDATE SET nombre = EXCLUDED.nombre`,
        [dt.code, dt.nombre, dt.color, dt.fillColor, dt.bgBadge, dt.textBadge, dt.icon]
      );
    }

    // Clean existing mock data
    await client.query('DELETE FROM need_reports');
    await client.query('DELETE FROM refugee_camps');
    await client.query('DELETE FROM collection_centers');
    await client.query('DELETE FROM disaster_zones');

    console.log('Seeding disaster_zones, refugee_camps, collection_centers, and need_reports for ALL 24 states...');

    const categories = ['ALIMENTOS', 'MEDICINAS', 'AGUA', 'REFUGIO', 'ROPA', 'EQUIPO_MEDICO', 'HIGIENE'];
    const itemsMap = {
      ALIMENTOS: ['Harina PAN (1kg)', 'Arroz (1kg)', 'Granos / Caraotas', 'Leche en Polvo', 'Aceite Vegetal (1L)', 'Kits de Enlatados'],
      MEDICINAS: ['Acetaminofén 500mg', 'Insulina Rápida', 'Amoxicilina 500mg', 'Suero Oral Hiposódico', 'Ibuprofeno 400mg', 'Gasas y Antisépticos'],
      AGUA: ['Agua Potable 5L', 'Agua Embotellada 1.5L', 'Pastillas Purificadoras', 'Bidones Sanitarios 20L'],
      REFUGIO: ['Carpas Familiares (4P)', 'Colchonetas Impermeables', 'Cobijas Térmicas', 'Lonas Plásticas 6x4m'],
      ROPA: ['Ropa Infantil Variada', 'Calzado Resistente', 'Impermeables de Lluvia', 'Mudas de Adulto'],
      EQUIPO_MEDICO: ['Tensiómetros Digitales', 'Oxímetros de Pulso', 'Kits de Primeros Auxilios', 'Camillas Plegables'],
      HIGIENE: ['Jabón Antiséptico', 'Kits de Higiene Femenina', 'Pañales Desechables', 'Crema Dental y Cepillos']
    };

    let reportCounter = 0;

    for (const st of states) {
      // RULE: La Guaira (22), Distrito Capital (10), and Miranda (15) MUST ONLY HAVE TERREMOTO!
      const isTerremotoOnly = (st.nombre === 'La Guaira' || st.nombre === 'Distrito Capital' || st.nombre === 'Miranda');
      
      const disasterType = isTerremotoOnly
        ? 'TERREMOTO'
        : ['INUNDACION', 'DESLAVE', 'INCENDIO', 'SEQUIA', 'HURACAN'][st.id % 5];

      const dzId = `dz_${st.codigo.toLowerCase().replace('-', '_')}_1`;
      const dzName = `Zona Afectada ${st.nombre} - ${disasterType}`;

      // Insert Disaster Zone
      await client.query(
        `INSERT INTO disaster_zones (id, nombre, tipo, lat, lng, "radioMetros", "estadoId")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [dzId, dzName, disasterType, st.lat + 0.02, st.lng - 0.02, 3500, st.id]
      );

      // Insert Refugee Camp
      const campId = `camp_${st.codigo.toLowerCase().replace('-', '_')}_1`;
      const campName = `Campamento Refugio ${st.nombre}`;
      const poblacion = 120 + (st.id * 15);
      const familias = Math.round(poblacion / 4);

      await client.query(
        `INSERT INTO refugee_camps (id, nombre, lat, lng, poblacion, familias, capacidad, coordinador, "estadoId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [campId, campName, st.lat + 0.015, st.lng + 0.015, poblacion, familias, poblacion + 80, `Coordinador ${st.nombre}`, st.id]
      );

      // Insert Collection Center
      const acopioId = `acopio_${st.codigo.toLowerCase().replace('-', '_')}_1`;
      const acopioName = `Centro de Acopio Central ${st.nombre}`;

      await client.query(
        `INSERT INTO collection_centers (id, nombre, lat, lng, "stockInfo", contacto, "estadoId")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [acopioId, acopioName, st.lat - 0.015, st.lng - 0.015, 'Stock Operativo Alto', `+58 412-${1000000 + st.id}`, st.id]
      );

      // Insert 3 Need Reports per state (72 total need reports across Venezuela)
      for (let r = 1; r <= 3; r++) {
        const repId = `rep_${st.codigo.toLowerCase().replace('-', '_')}_${r}`;
        const cat = categories[(st.id + r) % categories.length];
        const itemList = itemsMap[cat];
        const item = itemList[r % itemList.length];
        const cantReq = 50 + (st.id * 10) + (r * 25);
        const status = r === 1 ? 'SIN_COBERTURA' : (r === 2 ? 'PARCIAL' : 'SIN_COBERTURA');
        const horasSin = 12 + (r * 8) + (st.id % 24);

        const zonaJson = {
          lat: st.lat + (r * 0.005),
          lng: st.lng - (r * 0.005),
          campamento: campName,
          infrastructureId: campId,
          infrastructureType: 'CAMPAMENTO'
        };

        const recursoJson = {
          categoria: cat,
          item: item,
          cantidadRequerida: cantReq,
          unidad: cat === 'AGUA' ? 'Litros' : 'Unidades'
        };

        const metadataJson = {
          poblacionVulnerable: true,
          horasSinCobertura: horasSin,
          confirmacionesLocales: 3 + r,
          donacionesEnTransito: r === 2 ? Math.round(cantReq * 0.3) : 0,
          volumenPoblacionNormalizado: poblacion
        };

        await client.query(
          `INSERT INTO need_reports (id, tipo, zona, recurso, "metadataUrgencia", status, "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [repId, 'NECESIDAD', JSON.stringify(zonaJson), JSON.stringify(recursoJson), JSON.stringify(metadataJson), status]
        );

        reportCounter++;
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Seed process completed successfully!`);
    console.log(`Summary:`);
    console.log(`- 24 Estados de Venezuela registrados.`);
    console.log(`- La Guaira, Distrito Capital y Miranda configurados EXCLUSIVAMENTE con desastre 'TERREMOTO'.`);
    console.log(`- 24 Campamentos de refugio (1 por estado).`);
    console.log(`- 24 Centros de acopio (1 por estado).`);
    console.log(`- ${reportCounter} Reportes de necesidades de insumos registrados (3 por estado).`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error executing seed:', err);
  } finally {
    await client.end();
  }
}

seed();
