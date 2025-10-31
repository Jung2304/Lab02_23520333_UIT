/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
const TodoApp = () => {
    const [todos, setTodos] = useState([]);
    const [getInput] = useState({ currentValue: "" });
    const [filter, setFilter] = useState("all");
    const handleAdd = () => {
        const text = getInput.currentValue?.trim() || "";
        if (!text)
            return;
        setTodos([...todos(), { id: Date.now(), text, completed: false }]);
        getInput.currentValue = "";
        const inputEl = getInput.ref;
        if (inputEl)
            inputEl.value = "";
    };
    const handleToggle = (id) => setTodos(todos().map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
    const handleDelete = (id) => setTodos(todos().filter((t) => t.id !== id));
    const filteredTodos = filter() === "active"
        ? todos().filter((t) => !t.completed)
        : filter() === "completed"
            ? todos().filter((t) => t.completed)
            : todos();
    const stats = {
        completed: todos().filter((t) => t.completed).length,
        total: todos().length,
    };
    return (createElement("div", { style: {
            marginTop: "32px",
            padding: "20px",
            background: "#111827",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
            color: "#f3f4f6",
        } },
        createElement("h2", { style: {
                marginBottom: "16px",
                color: "#e5e7eb",
                fontSize: "20px",
                textAlign: "center",
            } }, "\uD83E\uDDFE Todo Tracker (Dark)"),
        createElement("div", { style: {
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                alignItems: "center",
            } },
            createElement("input", { defaultValue: "", ref: (el) => (getInput.ref = el), onInput: (e) => (getInput.currentValue = e.target.value), placeholder: "Add a task...", style: {
                    flex: 1,
                    borderRadius: "6px",
                    border: "1px solid #374151",
                    background: "#1f2937",
                    color: "#f9fafb",
                    padding: "8px",
                    fontSize: "14px",
                } }),
            createElement("button", { onClick: handleAdd, style: {
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                } }, "Add")),
        createElement("div", { style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
            } },
            createElement("span", { style: { color: "#9ca3af", fontSize: "13px" } },
                "\u2705 ",
                stats.completed,
                " / ",
                stats.total,
                " done"),
            createElement("div", { style: { display: "flex", gap: "6px" } }, ["all", "active", "completed"].map((type) => (createElement("button", { key: type, onClick: () => setFilter(type), style: {
                    background: filter() === type ? "#4f46e5" : "#1f2937",
                    color: filter() === type ? "#fff" : "#d1d5db",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    cursor: "pointer",
                } }, type.charAt(0).toUpperCase() + type.slice(1)))))),
        createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0 } }, filteredTodos.length === 0 ? (createElement("li", { style: {
                textAlign: "center",
                color: "#6b7280",
                padding: "10px 0",
            } }, "Nothing here")) : (filteredTodos.map((t) => (createElement("li", { key: t.id, style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#1f2937",
                border: "1px solid #374151",
            } },
            createElement("span", { onClick: () => handleToggle(t.id), style: {
                    textDecoration: t.completed ? "line-through" : "none",
                    color: t.completed ? "#6b7280" : "#f9fafb",
                    cursor: "pointer",
                    flex: 1,
                } }, t.text),
            createElement("button", { onClick: () => handleDelete(t.id), style: {
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    cursor: "pointer",
                } }, "Delete"))))))));
};
export { TodoApp };
