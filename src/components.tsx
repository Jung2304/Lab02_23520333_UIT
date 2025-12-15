/** @jsx createElement */
import { createElement } from "./jsx-runtime";

// ============================================
// Card Component
// ============================================
interface CardProps {
  title?: string;
  children?: any;
  className?: string;
  onClick?: () => void;
}

const Card = ({ title, children, className = "", onClick }: CardProps) => {
  const baseStyle = {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,.06)",
    cursor: onClick ? "pointer" : "default",
    transition: "box-shadow 0.2s ease",
  };

  const handleClick = onClick
    ? (e: Event) => {
        onClick();
      }
    : undefined;

  return (
    <div
      className={`card ${className}`}
      style={baseStyle}
      onClick={handleClick}
    >
      {title && (
        <div
          className="card-title"
          style={{
            fontWeight: 600,
            marginBottom: "8px",
            color: "#111827",
            fontSize: "16px",
          }}
        >
          {title}
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

// ============================================
// Modal Component
// ============================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: any;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // STEP 1: Return null if not open
  if (!isOpen) return null;

  // STEP 3: Handle click outside to close
  const handleOverlayClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  // STEP 2: Create overlay and modal content
  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {title && (
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0",
              marginLeft: "auto",
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ============================================
// Form Component
// ============================================
interface FormProps {
  onSubmit: (e: Event) => void;
  children?: any;
  className?: string;
}

const Form = ({ onSubmit, children, className = "" }: FormProps) => {
  // Handle form submission and prevent default
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`form ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {children}
    </form>
  );
};

// ============================================
// Input Component
// ============================================
interface InputProps {
  type?: string;
  value?: string;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input = ({
  type = "text",
  value,
  onChange,
  onInput,
  placeholder,
  className = "",
  name,
  required = false,
  disabled = false,
}: InputProps) => {
  // Create a styled input with proper event handling
  const baseStyle = {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
    backgroundColor: disabled ? "#f3f4f6" : "#fff",
    color: "#111827",
    width: "100%",
  };

  const handleFocus = (e: Event) => {
    const target = e.target as HTMLInputElement;
    target.style.borderColor = "#4f46e5";
  };

  const handleBlur = (e: Event) => {
    const target = e.target as HTMLInputElement;
    target.style.borderColor = "#d1d5db";
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onInput={onInput}
      placeholder={placeholder}
      className={`input ${className}`}
      style={baseStyle}
      name={name}
      required={required}
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

// ============================================
// Button Component (Bonus)
// ============================================
interface ButtonProps {
  children?: any;
  onClick?: (e: Event) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) => {
  const variants = {
    primary: {
      background: "#4f46e5",
      color: "#fff",
      hoverBg: "#4338ca",
    },
    secondary: {
      background: "#6b7280",
      color: "#fff",
      hoverBg: "#4b5563",
    },
    danger: {
      background: "#dc2626",
      color: "#fff",
      hoverBg: "#b91c1c",
    },
  };

  const style = variants[variant];

  const baseStyle = {
    background: disabled ? "#d1d5db" : style.background,
    color: style.color,
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s ease",
  };

  const handleMouseOver = (e: Event) => {
    if (!disabled) {
      (e.target as HTMLButtonElement).style.background = style.hoverBg;
    }
  };

  const handleMouseOut = (e: Event) => {
    if (!disabled) {
      (e.target as HTMLButtonElement).style.background = style.background;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${className}`}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
    </button>
  );
};

// Export all components
export { Card, Modal, Form, Input, Button };
