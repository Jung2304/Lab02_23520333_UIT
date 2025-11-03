export interface DataPoint {
  label: string; 
  value: number; 
  region?: string; 
  year?: number;
}

export const DataService = {
  generate(): DataPoint[] {
    const carBrands = ["Apple", "Orange", "Pearl", "Strawberry", "Blueberry", "Blackberry"];
    const regions = ["Asia", "Europe", "America"];
    const year = 2025;

    return carBrands.map((brand) => ({
      label: brand,
      value: Math.floor(Math.random() * 50000) + 10000, 
      region: regions[Math.floor(Math.random() * regions.length)],
      year,
    }));
  },
};
