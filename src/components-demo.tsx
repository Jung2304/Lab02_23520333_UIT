/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
import { Card, Modal, Form, Input, Button } from "./components";

// ============================================
// Component Library Demo
// ============================================
const ComponentsDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submittedData, setSubmittedData] = useState<any>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (e: Event) => {
    const data = formData();
    setSubmittedData(data);
    alert(`Form submitted!\nName: ${data.name}\nEmail: ${data.email}`);
  };

  const handleNameChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData(), name: target.value });
  };

  const handleEmailChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData(), email: target.value });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "24px",
          color: "#111827",
        }}
      >
        🎨 Component Library Demo
      </h2>

      {/* Card Examples */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px", color: "#374151" }}>
          Card Component
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <Card title="Basic Card">
            <p style={{ margin: 0 }}>This is a simple card component.</p>
          </Card>

          <Card title="Clickable Card" onClick={() => alert("Card clicked!")}>
            <p style={{ margin: 0 }}>Click anywhere on this card!</p>
          </Card>

          <Card>
            <p style={{ margin: 0 }}>Card without a title.</p>
          </Card>
        </div>
      </div>

      {/* Modal Example */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px", color: "#374151" }}>
          Modal Component
        </h3>
        <Button onClick={openModal} variant="primary">
          Open Modal
        </Button>

        <Modal
          isOpen={isModalOpen()}
          onClose={closeModal}
          title="Welcome to Modal!"
        >
          <p style={{ marginBottom: "16px" }}>
            This is a modal dialog. Click outside or press the × button to
            close.
          </p>
          <p style={{ marginBottom: "16px" }}>
            Modals are great for focused interactions without navigating away
            from the current page.
          </p>
          <Button onClick={closeModal} variant="secondary">
            Close Modal
          </Button>
        </Modal>
      </div>

      {/* Form Example */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px", color: "#374151" }}>
          Form & Input Components
        </h3>
        <Card title="Contact Form">
          <Form onSubmit={handleFormSubmit}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                Name *
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={formData().name}
                onInput={handleNameChange}
                required={true}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                Email *
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData().email}
                onInput={handleEmailChange}
                required={true}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <Button type="submit" variant="primary">
                Submit Form
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormData({ name: "", email: "" })}
              >
                Clear
              </Button>
            </div>
          </Form>

          {submittedData() && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "6px",
              }}
            >
              <strong style={{ color: "#166534" }}>Last Submission:</strong>
              <div style={{ fontSize: "14px", marginTop: "4px" }}>
                Name: {submittedData().name}
              </div>
              <div style={{ fontSize: "14px" }}>
                Email: {submittedData().email}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Button Variants */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px", color: "#374151" }}>
          Button Variants
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => alert("Primary clicked!")}>
            Primary Button
          </Button>
          <Button
            variant="secondary"
            onClick={() => alert("Secondary clicked!")}
          >
            Secondary Button
          </Button>
          <Button variant="danger" onClick={() => alert("Danger clicked!")}>
            Danger Button
          </Button>
          <Button variant="primary" disabled={true}>
            Disabled Button
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ComponentsDemo };
