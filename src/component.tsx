/** @jsx createElement */
import { createElement } from "./jsx-runtime";

interface CardProps {
  title?: string;
  children?: any;
}

export const Card = ({ title, children }: CardProps) => {
  return (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
      }}
    >
      {title && (
        <div style={{ fontWeight: 600, marginBottom: "8px", color: "#111827" }}>
          {title}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
};
