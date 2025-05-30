
import { transformPlacesData, sortPlacesByRating, buildPlacesRequestBody } from './utils.ts';
import { categoryConfigs } from './constants.ts';

// Fetch places from Google Places API
export async function fetchPlacesFromAPI(
  category: string, 
  lat: number, 
  lng: number, 
  apiKey: string,
  radius: number = 5000
) {
  console.log(`Fetching places API for category: ${category}, coordinates: ${lat},${lng}, radius: ${radius}m`);
  
  // Find which category config to use
  let config;
  let includedTypes;
  
  if (categoryConfigs[category]) {
    config = categoryConfigs[category];
    includedTypes = config.includedTypes;
    console.log(`Using predefined category config for ${category} with types:`, includedTypes);
  } else {
    // Check if this is a specific type within a category
    let foundCategory = null;
    
    for (const [catKey, catConfig] of Object.entries(categoryConfigs)) {
      if (catConfig.includedTypes.includes(category)) {
        foundCategory = catKey;
        config = categoryConfigs[foundCategory];
        // Override the included types to be just the requested one
        includedTypes = [category];
        console.log(`Found ${category} as type within category ${foundCategory}`);
        break;
      }
    }
    
    // If it's a completely custom type, create a single category for it
    if (!foundCategory) {
      console.log(`Using custom type for ${category}`);
      config = {
        includedTypes: [category],
        maxResults: 20
      };
      includedTypes = [category];
    }
  }
  
  try {
    console.log(`Making Places API v1 request for ${category}`);
    
    // Build request body
    const requestBody = {
      includedTypes: includedTypes,
      maxResultCount: config.maxResults,
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng
          },
          radius: radius
        }
      }
    };
    
    console.log(`Request body for ${category}:`, JSON.stringify(requestBody));
    
    // Make request to Places API v1
    const placesResponse = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryType,places.types,places.location'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    const responseStatus = placesResponse.status;
    const responseText = await placesResponse.text();
    
    console.log(`Places API v1 response status: ${responseStatus}`);
    console.log(`Places API v1 response for ${category}:`, responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    let placesData;
    try {
      placesData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Error parsing Places API response: ${parseError.message}`);
      return [];
    }
    
    if (!placesData.places || !Array.isArray(placesData.places)) {
      console.log(`No places found from v1 API for category ${category}:`, placesData);
      if (placesData.error) {
        console.error(`API error for ${category}:`, placesData.error);
      }
      return [];
    }
    
    console.log(`Found ${placesData.places.length} places from v1 API for category ${category}`);
    
    // Transform and sort the data
    const transformedPlaces = transformPlacesData(placesData.places, category, lat, lng);
    return sortPlacesByRating(transformedPlaces);
    
  } catch (error) {
    console.error(`Error with Places API for ${category}:`, error);
    return [];
  }
}
