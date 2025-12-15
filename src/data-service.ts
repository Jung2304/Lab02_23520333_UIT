export interface DataPoint {
  label: string;
  value: number;
  region?: string;
  year?: number;
  category?: string;
  date?: Date;
}

export type ChartType = "bar" | "line" | "pie";
export type Category = "Fruits" | "Vegetables" | "Dairy" | "Grains";
export type Region = "Asia" | "Europe" | "America" | "Africa";

// Mock data service class with real-time updates and filtering
export class DataService {
  private static categories: Category[] = ["Fruits", "Vegetables", "Dairy", "Grains"];
  private static regions: Region[] = ["Asia", "Europe", "America", "Africa"];
  
  private static fruitsData = ["Apple", "Orange", "Banana", "Strawberry", "Blueberry", "Mango"];
  private static vegetablesData = ["Carrot", "Broccoli", "Spinach", "Tomato", "Potato", "Lettuce"];
  private static dairyData = ["Milk", "Cheese", "Yogurt", "Butter", "Cream", "Ice Cream"];
  private static grainsData = ["Rice", "Wheat", "Corn", "Oats", "Barley", "Quinoa"];

  // Generate mock data
  static generate(count: number = 6, category?: Category): DataPoint[] {
    const items = this.getItemsByCategory(category);
    const selectedItems = items.slice(0, count);

    return selectedItems.map((label) => ({
      label,
      value: Math.floor(Math.random() * 50000) + 10000,
      region: this.regions[Math.floor(Math.random() * this.regions.length)],
      year: 2025,
      category: category || this.getCategoryForItem(label),
      date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    }));
  }

  // Simulate real-time updates - returns new data with slight variations
  static simulateUpdate(currentData: DataPoint[]): DataPoint[] {
    return currentData.map((point) => ({
      ...point,
      value: Math.max(
        5000,
        point.value + (Math.random() - 0.5) * 10000 // Random fluctuation
      ),
    }));
  }

  // Filter data by category
  static filterByCategory(data: DataPoint[], category: Category): DataPoint[] {
    return data.filter((point) => point.category === category);
  }

  // Filter data by region
  static filterByRegion(data: DataPoint[], region: Region): DataPoint[] {
    return data.filter((point) => point.region === region);
  }

  // Filter data by date range
  static filterByDateRange(
    data: DataPoint[],
    startDate: Date,
    endDate: Date
  ): DataPoint[] {
    return data.filter((point) => {
      if (!point.date) return false;
      return point.date >= startDate && point.date <= endDate;
    });
  }

  // Get top N items by value
  static getTopN(data: DataPoint[], n: number): DataPoint[] {
    return [...data].sort((a, b) => b.value - a.value).slice(0, n);
  }

  // Get all categories
  static getCategories(): Category[] {
    return [...this.categories];
  }

  // Get all regions
  static getRegions(): Region[] {
    return [...this.regions];
  }

  // Generate time series data for line charts
  static generateTimeSeries(
    label: string,
    days: number = 30
  ): DataPoint[] {
    const data: DataPoint[] = [];
    const baseValue = Math.floor(Math.random() * 30000) + 10000;

    for (let i = 0; i < days; i++) {
      const date = new Date(2025, 0, i + 1);
      const variation = (Math.random() - 0.5) * 5000;
      data.push({
        label: date.toLocaleDateString(),
        value: Math.max(5000, baseValue + variation + (i * 500)), // Slight upward trend
        date,
        category: "Fruits",
      });
    }

    return data;
  }

  // Helper: Get items by category
  private static getItemsByCategory(category?: Category): string[] {
    if (!category) {
      return [
        ...this.fruitsData,
        ...this.vegetablesData,
        ...this.dairyData,
        ...this.grainsData,
      ];
    }

    switch (category) {
      case "Fruits":
        return this.fruitsData;
      case "Vegetables":
        return this.vegetablesData;
      case "Dairy":
        return this.dairyData;
      case "Grains":
        return this.grainsData;
      default:
        return this.fruitsData;
    }
  }

  // Helper: Get category for an item
  private static getCategoryForItem(label: string): Category {
    if (this.fruitsData.includes(label)) return "Fruits";
    if (this.vegetablesData.includes(label)) return "Vegetables";
    if (this.dairyData.includes(label)) return "Dairy";
    if (this.grainsData.includes(label)) return "Grains";
    return "Fruits";
  }
}

