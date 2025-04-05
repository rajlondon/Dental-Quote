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
  return flightEstimates.map(estimate => ({
    city: estimate.city,
    country: estimate.country
  }));
};