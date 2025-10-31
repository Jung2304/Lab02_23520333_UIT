/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
import { DataService } from "./data-service";
import { Card } from "./component";
import { Chart } from "./chart";
const Dashboard = () => {
    // Sinh dữ liệu ngẫu nhiên
    const [getData, setData] = useState(DataService.generate());
    // Nút Refresh sinh dữ liệu mới
    const refresh = () => setData(DataService.generate());
    const data = getData();
    console.log("Dashboard rendering", getData());
    // Hàm xử lý hover/out để tránh warning TS7006
    const handleHover = (e) => {
        e.target.style.background = "#4338ca";
    };
    const handleOut = (e) => {
        e.target.style.background = "#4f46e5";
    };
    return (createElement("div", { style: { maxWidth: "800px", margin: "0 auto" } },
        createElement("h2", { style: {
                textAlign: "center",
                marginBottom: "24px",
                color: "#111827",
                fontWeight: "600",
            } }, "Dashboard - Car Sales Random"),
        createElement("div", { style: {
                display: "flex",
                flexDirection: "column", // 👈 Xếp dọc
                gap: "16px",
                marginBottom: "24px",
            } },
            createElement(Card, { title: "Bar Chart" },
                createElement(Chart, { data: data, type: "bar" })),
            createElement(Card, { title: "Line Chart" },
                createElement(Chart, { data: data, type: "line" })),
            createElement(Card, { title: "Pie Chart" },
                createElement(Chart, { data: data, type: "pie" }))),
        createElement("div", { style: { textAlign: "center" } },
            createElement("button", { onClick: refresh, onMouseOver: handleHover, onMouseOut: handleOut, style: {
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.2s",
                } }, "\uD83D\uDD04 Refresh Data"))));
};
export { Dashboard };
