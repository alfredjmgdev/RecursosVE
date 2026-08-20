import { NextResponse } from 'next/server';

// Known fallbacks for major Venezuelan locations to ensure instant offline/resilient geocoding
const VENEZUELA_FALLBACKS = [
  { place_id: 101, display_name: 'La Guaira, Estado La Guaira, Venezuela', lat: '10.6010', lon: '-66.9320' },
  { place_id: 102, display_name: 'Caracas, Distrito Capital, Venezuela', lat: '10.4806', lon: '-66.9036' },
  { place_id: 103, display_name: 'Puerto Ayacucho, Estado Amazonas, Venezuela', lat: '5.6639', lon: '-67.6236' },
  { place_id: 104, display_name: 'Barcelona, Estado Anzoátegui, Venezuela', lat: '10.1333', lon: '-64.7000' },
  { place_id: 105, display_name: 'San Fernando de Apure, Estado Apure, Venezuela', lat: '7.8878', lon: '-67.4724' },
  { place_id: 106, display_name: 'Maracay, Estado Aragua, Venezuela', lat: '10.2469', lon: '-67.5958' },
  { place_id: 107, display_name: 'Barinas, Estado Barinas, Venezuela', lat: '8.6226', lon: '-70.2075' },
  { place_id: 108, display_name: 'Ciudad Guayana, Estado Bolívar, Venezuela', lat: '8.3533', lon: '-62.6410' },
  { place_id: 109, display_name: 'Valencia, Estado Carabobo, Venezuela', lat: '10.1620', lon: '-68.0077' },
  { place_id: 110, display_name: 'San Carlos, Estado Cojedes, Venezuela', lat: '9.6612', lon: '-68.5827' },
  { place_id: 111, display_name: 'Tucupita, Estado Delta Amacuro, Venezuela', lat: '9.0622', lon: '-62.0544' },
  { place_id: 112, display_name: 'Coro, Estado Falcón, Venezuela', lat: '11.4045', lon: '-69.6734' },
  { place_id: 113, display_name: 'San Juan de los Morros, Estado Guárico, Venezuela', lat: '9.9115', lon: '-67.3538' },
  { place_id: 114, display_name: 'Barquisimeto, Estado Lara, Venezuela', lat: '10.0678', lon: '-69.3474' },
  { place_id: 115, display_name: 'Mérida, Estado Mérida, Venezuela', lat: '8.5983', lon: '-71.1449' },
  { place_id: 116, display_name: 'Los Teques, Estado Miranda, Venezuela', lat: '10.3444', lon: '-67.0428' },
  { place_id: 117, display_name: 'Maturín, Estado Monagas, Venezuela', lat: '9.7457', lon: '-63.1832' },
  { place_id: 118, display_name: 'La Asunción, Estado Nueva Esparta, Venezuela', lat: '11.0333', lon: '-63.8628' },
  { place_id: 119, display_name: 'Guanare, Estado Portuguesa, Venezuela', lat: '9.0418', lon: '-69.7421' },
  { place_id: 120, display_name: 'Cumaná, Estado Sucre, Venezuela', lat: '10.4537', lon: '-64.1826' },
  { place_id: 121, display_name: 'San Cristóbal, Estado Táchira, Venezuela', lat: '7.7669', lon: '-72.2250' },
  { place_id: 122, display_name: 'Trujillo, Estado Trujillo, Venezuela', lat: '9.3709', lon: '-70.4357' },
  { place_id: 123, display_name: 'San Felipe, Estado Yaracuy, Venezuela', lat: '10.3399', lon: '-68.7425' },
  { place_id: 124, display_name: 'Maracaibo, Estado Zulia, Venezuela', lat: '10.6427', lon: '-71.6125' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query) {
    return NextResponse.json([]);
  }

  // Check local fallback first
  const normalizedQuery = query.toLowerCase();
  const matchedFallbacks = VENEZUELA_FALLBACKS.filter((item) =>
    item.display_name.toLowerCase().includes(normalizedQuery),
  );

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ve&limit=5`,
      {
        headers: {
          'User-Agent': 'RecursosVE-App/1.0 (humanitarian-logistics)',
        },
      },
    );

    if (res.ok) {
      const remoteData = await res.json();
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        return NextResponse.json(remoteData);
      }
    }
  } catch (error) {
    console.warn('Geocoding API network warning, returning fallback matches:', error);
  }

  // Return fallback matches if remote API failed or returned empty
  return NextResponse.json(matchedFallbacks);
}
