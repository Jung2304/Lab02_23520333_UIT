export interface DataPoint {
  label: string; // Hãng xe
  value: number; // Doanh số bán (số xe)
  region?: string; // Khu vực (tuỳ chọn)
  year?: number; // Năm (tuỳ chọn)
}

export const DataService = {
  generate(): DataPoint[] {
    const carBrands = ["Toyota", "Honda", "Ford", "BMW", "Tesla", "Hyundai"];
    const regions = ["Asia", "Europe", "America"];
    const year = 2025;

    // Sinh ngẫu nhiên dữ liệu cho từng hãng
    return carBrands.map((brand) => ({
      label: brand,
      value: Math.floor(Math.random() * 50000) + 10000, // 10k–60k xe
      region: regions[Math.floor(Math.random() * regions.length)],
      year,
    }));
  },
};
