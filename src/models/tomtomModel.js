const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

export const tomtomModel = {
  search: async (query) => {
    const res = await fetch(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_KEY}&countrySet=IN&limit=5`
    );
    const data = await res.json();
    return data.results || [];
  },
  calculateRoute: async (startPos, destPos) => {
    const res = await fetch(
      `https://api.tomtom.com/routing/1/calculateRoute/${startPos[0]},${startPos[1]}:${destPos[0]},${destPos[1]}/json?key=${TOMTOM_KEY}&travelMode=car&instructionsType=text`
    );
    return res.json();
  }
};
