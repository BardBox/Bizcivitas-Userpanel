/**
 * Area and Pincode API Utility
 * Fetches areas and pincodes for a given city using hybrid API system
 *
 * API Strategy:
 * 1. India Post Office API (FREE, unlimited) - Primary for Indian cities
 * 2. Zipcodebase API (10k/month free) - Fallback for international cities
 * 3. Manual entry - Always available as final fallback
 */

export interface AreaOption {
  label: string;    // Display label: "Alkapuri (390007)"
  value: string;    // Area name: "Alkapuri"
  pincode: string;  // Pincode: "390007"
}

// Country name to ISO code mapping for Zipcodebase API
const COUNTRY_CODE_MAP: Record<string, string> = {
  'India': 'IN',
  'UAE': 'AE',
  'United Arab Emirates': 'AE',
  'USA': 'US',
  'United States': 'US',
  'UK': 'GB',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'Singapore': 'SG',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Ireland': 'IE',
  'Greece': 'GR',
  'Czech Republic': 'CZ',
  'Romania': 'RO',
  'Hungary': 'HU',
  'Japan': 'JP',
  'China': 'CN',
  'South Korea': 'KR',
  'Thailand': 'TH',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'South Africa': 'ZA',
  'Egypt': 'EG',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'New Zealand': 'NZ',
  'Turkey': 'TR',
  'Saudi Arabia': 'SA',
  'Israel': 'IL',
  'Russia': 'RU',
};

/**
 * Fetch areas and pincodes for a given city
 * @param cityName - Name of the city (e.g., "Vadodara", "Dubai")
 * @param countryName - Name of the country (e.g., "India", "UAE")
 * @returns Array of area options with pincode information
 */
export const fetchAreasAndPincodes = async (
  cityName: string,
  countryName: string = 'India'
): Promise<AreaOption[]> => {
  console.log('🔍 Fetching areas for city:', cityName, '| Country:', countryName);

  if (!cityName || !countryName) {
    console.warn('⚠️ City name or country name is missing');
    return [];
  }

  try {
    // ✅ STEP 1: Try India Post Office API (FREE, unlimited, India only)
    if (countryName === 'India') {
      console.log('📡 Attempting India Post Office API...');
      const indiaApiUrl = `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`;

      try {
        const response = await fetch(indiaApiUrl);
        const data = await response.json();

        if (response.ok && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          console.log('✅ India Post API Success!');
          const postOffices = data[0].PostOffice;
          const areaMap = new Map<string, string>(); // Deduplicate areas

          postOffices.forEach((po: any) => {
            let areaName = po.Name;
            const pincode = po.Pincode;

            // Clean up area name: Remove city name suffix if present
            // Example: "Fatepura (Vadodara)" -> "Fatepura"
            // Example: "Alkapuri (Baroda)" -> "Alkapuri"
            if (areaName && areaName.includes('(')) {
              areaName = areaName.split('(')[0].trim();
            }

            // Filter out invalid or duplicate entries
            if (areaName && pincode && !areaMap.has(areaName)) {
              areaMap.set(areaName, pincode);
            }
          });

          const areas = Array.from(areaMap.entries()).map(([areaName, pincode]) => ({
            label: `${areaName} (${pincode})`,
            value: areaName,
            pincode: pincode,
          }));

          console.log(`✅ Found ${areas.length} areas from India Post API`);
          return areas;
        }
      } catch (indiaError) {
        console.warn('⚠️ India Post API failed:', indiaError);
        // Continue to Zipcodebase fallback
      }
    }

    // ⚠️ STEP 2: India API failed or non-Indian city, try Zipcodebase API
    console.log('📡 Attempting Zipcodebase API (international fallback)...');

    const countryCode = COUNTRY_CODE_MAP[countryName] || 'IN';
    const apiKey = process.env.NEXT_PUBLIC_ZIPCODEBASE_API_KEY;

    if (!apiKey) {
      console.error('❌ Zipcodebase API key not configured in environment variables');
      console.log('💡 Add NEXT_PUBLIC_ZIPCODEBASE_API_KEY to your .env.local file');
      return [];
    }

    const zipcodeApiUrl = `https://app.zipcodebase.com/api/v1/search?apikey=${apiKey}&city=${encodeURIComponent(cityName)}&country=${countryCode}`;

    try {
      const response = await fetch(zipcodeApiUrl);
      const data = await response.json();

      if (response.ok && data.results && Object.keys(data.results).length > 0) {
        console.log('✅ Zipcodebase API Success!');
        const areaMap = new Map<string, string>(); // Deduplicate areas

        Object.entries(data.results).forEach(([pincode, locations]: [string, any]) => {
          if (Array.isArray(locations)) {
            locations.forEach((loc: any) => {
              // Try multiple fields for area name
              const areaName = loc.province_en || loc.city_en || loc.state_en;

              if (areaName && !areaMap.has(areaName)) {
                areaMap.set(areaName, pincode);
              }
            });
          }
        });

        const areas = Array.from(areaMap.entries()).map(([areaName, pincode]) => ({
          label: `${areaName} (${pincode})`,
          value: areaName,
          pincode: pincode,
        }));

        console.log(`✅ Found ${areas.length} areas from Zipcodebase API`);
        return areas;
      } else {
        console.warn('⚠️ Zipcodebase API returned empty results');
      }
    } catch (zipcodeError) {
      console.error('❌ Zipcodebase API error:', zipcodeError);
    }

    // ❌ STEP 3: Both APIs failed
    console.log('⚠️ No areas found from any API. User will need to enter manually.');
    return [];

  } catch (error) {
    console.error('❌ Unexpected error fetching areas:', error);
    return [];
  }
};

/**
 * Get country ISO code for Zipcodebase API
 * @param countryName - Full country name
 * @returns ISO country code or 'IN' as default
 */
export const getCountryCode = (countryName: string): string => {
  return COUNTRY_CODE_MAP[countryName] || 'IN';
};

/**
 * Check if area fetching is supported for a country
 * @param countryName - Full country name
 * @returns true if country is supported
 */
export const isCountrySupported = (countryName: string): boolean => {
  return countryName === 'India' || countryName in COUNTRY_CODE_MAP;
};
