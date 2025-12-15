/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
import { DataService, Category, ChartType } from "./data-service";
import { Card } from "./component";
import { Chart } from "./chart";

const Dashboard = () => {
  // State management
  const [getData, setData] = useState(DataService.generate());
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [category, setCategory] = useState<Category | "All">("All");
  const [isAutoUpdate, setIsAutoUpdate] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [updateInterval, setUpdateInterval] = useState<any>(null);

  const data = getData();

  // Refresh data
  const refresh = () => {
    const newData = category === "All" 
      ? DataService.generate(6) 
      : DataService.generate(6, category);
    setData(newData);
    setSelectedPoint(null);
  };

  // Toggle real-time updates
  const toggleAutoUpdate = () => {
    if (isAutoUpdate()) {
      // Stop auto-update
      if (updateInterval()) {
        clearInterval(updateInterval());
        setUpdateInterval(null);
      }
      setIsAutoUpdate(false);
    } else {
      // Start auto-update
      setIsAutoUpdate(true);
      const interval = setInterval(() => {
        setData(DataService.simulateUpdate(getData()));
      }, 2000); // Update every 2 seconds
      setUpdateInterval(interval);
    }
  };

  // Change chart type
  const changeChartType = (type: ChartType) => {
    setChartType(type);
  };

  // Change category filter
  const changeCategory = (cat: Category | "All") => {
    setCategory(cat);
    const newData = cat === "All" 
      ? DataService.generate(6) 
      : DataService.generate(6, cat);
    setData(newData);
    setSelectedPoint(null);
  };

  // Handle data point click
  const handleDataPointClick = (dataPoint: any) => {
    setSelectedPoint(dataPoint);
  };

  // Calculate statistics
  const stats = {
    total: data.reduce((sum, d) => sum + d.value, 0),
    average: Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length),
    max: Math.max(...data.map(d => d.value)),
    min: Math.min(...data.map(d => d.value)),
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          color: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "32px",
            fontWeight: "700",
          }}
        >
          📊 Sales Dashboard
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
          Real-time analytics and interactive charts
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
              Total Sales
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>
              ${stats.total.toLocaleString()}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
              Average
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#3b82f6" }}>
              ${stats.average.toLocaleString()}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
              Highest
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
              ${stats.max.toLocaleString()}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
              Lowest
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#ef4444" }}>
              ${stats.min.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card title="Controls">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Chart Type Selector */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Chart Type
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["bar", "line", "pie"] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => changeChartType(type)}
                  style={{
                    background: chartType() === type ? "#4f46e5" : "#f3f4f6",
                    color: chartType() === type ? "#fff" : "#374151",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Category Filter
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["All", ...DataService.getCategories()] as (Category | "All")[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => changeCategory(cat)}
                  style={{
                    background: category() === cat ? "#10b981" : "#f3f4f6",
                    color: category() === cat ? "#fff" : "#374151",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={refresh}
              style={{
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🔄 Refresh Data
            </button>

            <button
              onClick={toggleAutoUpdate}
              style={{
                background: isAutoUpdate() ? "#ef4444" : "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isAutoUpdate() ? "⏸️ Stop" : "▶️ Start"} Auto-Update
            </button>
          </div>
        </div>
      </Card>

      {/* Chart Display */}
      <div style={{ marginTop: "24px" }}>
        <Card title={`${chartType().charAt(0).toUpperCase() + chartType().slice(1)} Chart - ${category()}`}>
          <Chart 
            data={data} 
            type={chartType()} 
            width={800}
            height={400}
            onDataPointClick={handleDataPointClick}
          />
        </Card>
      </div>

      {/* Selected Data Point Info */}
      {selectedPoint() && (
        <div style={{ marginTop: "24px" }}>
          <Card title="📌 Selected Data Point">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  Label
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                  {selectedPoint().label}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  Value
                </div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#4f46e5" }}>
                  ${selectedPoint().value.toLocaleString()}
                </div>
              </div>

              {selectedPoint().category && (
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                    Category
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>
                    {selectedPoint().category}
                  </div>
                </div>
              )}

              {selectedPoint().region && (
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                    Region
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#f59e0b" }}>
                    {selectedPoint().region}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: "24px" }}>
        <Card>
          <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>
            <strong style={{ color: "#374151" }}>💡 Interactive Features:</strong>
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              <li>Hover over chart elements to highlight them</li>
              <li>Click on data points to view details</li>
              <li>Switch between Bar, Line, and Pie charts</li>
              <li>Filter data by category (Fruits, Vegetables, Dairy, Grains)</li>
              <li>Enable auto-update to simulate real-time data changes</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { Dashboard };
