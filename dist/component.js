/** @jsx createElement */
import { createElement } from "./jsx-runtime";
export const Card = ({ title, children }) => {
    return (createElement("div", { style: {
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        } },
        title && (createElement("div", { style: { fontWeight: 600, marginBottom: "8px", color: "#111827" } }, title)),
        createElement("div", null, children)));
};
