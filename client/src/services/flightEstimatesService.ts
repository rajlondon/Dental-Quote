// Flight price estimates based on travel month
// Data represents average return flight prices to Istanbul in EUR

export interface FlightEstimate {
  country: string;
  city: string;
  prices: {
    [month: string]: number;
  };
}

export const flightEstimates: FlightEstimate[] = [
  // United Kingdom
  {
    country: 'United Kingdom',
    city: 'London',
    prices: {
      January: 120,
      February: 110,
      March: 140,
      April: 170,
      May: 180,
      June: 220,
      July: 250,
      August: 240,
      September: 200,
      October: 170,
      November: 130,
      December: 160
    }
  },
  {
    country: 'United Kingdom',
    city: 'Manchester',
    prices: {
      January: 140,
      February: 130,
      March: 150,
      April: 180,
      May: 190,
      June: 230,
      July: 260,
      August: 250,
      September: 210,
      October: 180,
      November: 140,
      December: 170
    }
  },
  {
    country: 'United Kingdom',
    city: 'Edinburgh',
    prices: {
      January: 140,
      February: 130,
      March: 150,
      April: 180,
      May: 190,
      June: 230,
      July: 260,
      August: 250,
      September: 210,
      October: 180,
      November: 140,
      December: 170
    }
  },
  {
    country: 'United Kingdom',
    city: 'Birmingham',
    prices: {
      January: 135,
      February: 125,
      March: 145,
      April: 175,
      May: 185,
      June: 225,
      July: 255,
      August: 245,
      September: 205,
      October: 175,
      November: 135,
      December: 165
    }
  },
  {
    country: 'United Kingdom',
    city: 'Glasgow',
    prices: {
      January: 145,
      February: 135,
      March: 155,
      April: 185,
      May: 195,
      June: 235,
      July: 265,
      August: 255,
      September: 215,
      October: 185,
      November: 145,
      December: 175
    }
  },
  {
    country: 'United Kingdom',
    city: 'Bristol',
    prices: {
      January: 130,
      February: 120,
      March: 140,
      April: 170,
      May: 180,
      June: 220,
      July: 250,
      August: 240,
      September: 200,
      October: 170,
      November: 130,
      December: 160
    }
  },
  
  // Germany
  {
    country: 'Germany',
    city: 'Berlin',
    prices: {
      January: 110,
      February: 100,
      March: 130,
      April: 160,
      May: 170,
      June: 210,
      July: 240,
      August: 230,
      September: 190,
      October: 160,
      November: 120,
      December: 150
    }
  },
  {
    country: 'Germany',
    city: 'Munich',
    prices: {
      January: 115,
      February: 105,
      March: 135,
      April: 165,
      May: 175,
      June: 215,
      July: 245,
      August: 235,
      September: 195,
      October: 165,
      November: 125,
      December: 155
    }
  },
  {
    country: 'Germany',
    city: 'Frankfurt',
    prices: {
      January: 105,
      February: 95,
      March: 125,
      April: 155,
      May: 165,
      June: 205,
      July: 235,
      August: 225,
      September: 185,
      October: 155,
      November: 115,
      December: 145
    }
  },
  
  // France
  {
    country: 'France',
    city: 'Paris',
    prices: {
      January: 130,
      February: 120,
      March: 150,
      April: 180,
      May: 190,
      June: 230,
      July: 260,
      August: 250,
      September: 210,
      October: 180,
      November: 140,
      December: 170
    }
  },
  {
    country: 'France',
    city: 'Lyon',
    prices: {
      January: 125,
      February: 115,
      March: 145,
      April: 175,
      May: 185,
      June: 225,
      July: 255,
      August: 245,
      September: 205,
      October: 175,
      November: 135,
      December: 165
    }
  },
  {
    country: 'France',
    city: 'Nice',
    prices: {
      January: 135,
      February: 125,
      March: 155,
      April: 185,
      May: 195,
      June: 235,
      July: 265,
      August: 255,
      September: 215,
      October: 185,
      November: 145,
      December: 175
    }
  },
  
  // Ireland
  {
    country: 'Ireland',
    city: 'Dublin',
    prices: {
      January: 150,
      February: 140,
      March: 170,
      April: 200,
      May: 210,
      June: 250,
      July: 280,
      August: 270,
      September: 230,
      October: 200,
      November: 160,
      December: 190
    }
  },
  {
    country: 'Ireland',
    city: 'Cork',
    prices: {
      January: 155,
      February: 145,
      March: 175,
      April: 205,
      May: 215,
      June: 255,
      July: 285,
      August: 275,
      September: 235,
      October: 205,
      November: 165,
      December: 195
    }
  },
  
  // Netherlands
  {
    country: 'Netherlands',
    city: 'Amsterdam',
    prices: {
      January: 120,
      February: 110,
      March: 140,
      April: 170,
      May: 180,
      June: 220,
      July: 250,
      August: 240,
      September: 200,
      October: 170,
      November: 130,
      December: 160
    }
  },
  {
    country: 'Netherlands',
    city: 'Rotterdam',
    prices: {
      January: 125,
      February: 115,
      March: 145,
      April: 175,
      May: 185,
      June: 225,
      July: 255,
      August: 245,
      September: 205,
      October: 175,
      November: 135,
      December: 165
    }
  },
  
  // Spain
  {
    country: 'Spain',
    city: 'Madrid',
    prices: {
      January: 140,
      February: 130,
      March: 160,
      April: 190,
      May: 200,
      June: 240,
      July: 270,
      August: 260,
      September: 220,
      October: 190,
      November: 150,
      December: 180
    }
  },
  {
    country: 'Spain',
    city: 'Barcelona',
    prices: {
      January: 135,
      February: 125,
      March: 155,
      April: 185,
      May: 195,
      June: 235,
      July: 265,
      August: 255,
      September: 215,
      October: 185,
      November: 145,
      December: 175
    }
  },
  
  // Italy
  {
    country: 'Italy',
    city: 'Rome',
    prices: {
      January: 130,
      February: 120,
      March: 150,
      April: 180,
      May: 190,
      June: 230,
      July: 260,
      August: 250,
      September: 210,
      October: 180,
      November: 140,
      December: 170
    }
  },
  {
    country: 'Italy',
    city: 'Milan',
    prices: {
      January: 125,
      February: 115,
      March: 145,
      April: 175,
      May: 185,
      June: 225,
      July: 255,
      August: 245,
      September: 205,
      October: 175,
      November: 135,
      December: 165
    }
  }
];

export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getFlightEstimateForCity = (city: string, month: string): number | undefined => {
  const estimate = flightEstimates.find(e => e.city.toLowerCase() === city.toLowerCase());
  return estimate?.prices[month];
};

export const getDefaultFlightEstimate = (month: string): number | undefined => {
  // Default to London as the most common departure city
  return getFlightEstimateForCity('London', month);
};

export const getCities = (): {city: string, country: string}[] => {
  // Map cities and sort by country name and then by city name within each country
  return flightEstimates
    .map(estimate => ({
      city: estimate.city,
      country: estimate.country
    }))
    .sort((a, b) => {
      // First sort by country
      const countryCompare = a.country.localeCompare(b.country);
      if (countryCompare !== 0) {
        return countryCompare;
      }
      // Then sort by city within the same country
      return a.city.localeCompare(b.city);
    });
};

// Helper function to get cities grouped by country for easier dropdown display
export interface CountryWithCities {
  country: string;
  cities: string[];
}

export const getCitiesGroupedByCountry = (): CountryWithCities[] => {
  // Create a map to group cities by country
  const countryMap: { [country: string]: string[] } = {};
  
  // Populate the map
  flightEstimates.forEach(estimate => {
    if (!countryMap[estimate.country]) {
      countryMap[estimate.country] = [];
    }
    countryMap[estimate.country].push(estimate.city);
  });
  
  // Convert map to array and sort countries
  const result = Object.entries(countryMap).map(([country, cities]) => ({
    country,
    cities: cities.sort() // Sort cities alphabetically
  }));
  
  // Sort by country name
  return result.sort((a, b) => a.country.localeCompare(b.country));
};