interface GeocodingResult {
  latitude: number;
  longitude: number;
  endereco: string;
  bairro: string | null;
}

interface SearchAddressParams {
  endereco?: string | null;
  bairro?: string | null;
  cidade: string;
  estado?: string | null;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

interface NominatimReverseResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

function parseLatitude(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLongitude(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractBairro(address?: NominatimSearchResult['address'] | NominatimReverseResult['address']) {
  return address?.suburb ?? address?.neighbourhood ?? address?.city_district ?? null;
}

function extractEndereco(address?: NominatimSearchResult['address'] | NominatimReverseResult['address']) {
  const via = address?.road ?? address?.pedestrian ?? address?.footway ?? address?.path ?? '';
  const numero = 'house_number' in (address ?? {}) ? address?.house_number ?? '' : '';
  return [via, numero].filter(Boolean).join(', ').trim();
}

async function requestNominatim<T>(path: string, params: URLSearchParams) {
  const response = await fetch(`https://nominatim.openstreetmap.org/${path}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel consultar a localizacao informada.');
  }

  return response.json() as Promise<T>;
}

export const geocodingService = {
  async buscarCoordenadas({ endereco, bairro, cidade, estado }: SearchAddressParams): Promise<GeocodingResult | null> {
    const query = [endereco, bairro, cidade, estado, 'Brasil']
      .map((item) => item?.trim())
      .filter(Boolean)
      .join(', ');

    if (!query) {
      return null;
    }

    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'br',
      'accept-language': 'pt-BR',
    });

    const results = await requestNominatim<NominatimSearchResult[]>('search', params);
    const match = results[0];

    if (!match) {
      return null;
    }

    const latitude = parseLatitude(match.lat);
    const longitude = parseLongitude(match.lon);

    if (latitude === null || longitude === null) {
      return null;
    }

    return {
      latitude,
      longitude,
      endereco: extractEndereco(match.address) || match.display_name,
      bairro: extractBairro(match.address),
    };
  },

  async buscarEndereco(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'jsonv2',
      addressdetails: '1',
      'accept-language': 'pt-BR',
    });

    const result = await requestNominatim<NominatimReverseResult>('reverse', params);
    const parsedLatitude = parseLatitude(result.lat);
    const parsedLongitude = parseLongitude(result.lon);

    if (parsedLatitude === null || parsedLongitude === null) {
      return null;
    }

    return {
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      endereco: extractEndereco(result.address) || result.display_name,
      bairro: extractBairro(result.address),
    };
  },
};
