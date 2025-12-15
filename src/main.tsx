/** @jsx createElement */
import { createElement, mount } from "./jsx-runtime";
import { Counter } from "./counter";
import { TodoApp } from "./todo-app";
import { Dashboard } from "./dashboard";
import { ComponentsDemo } from "./components-demo";
import "./style.css";

const App = () => (
  <div>
    <h1
      style={{
        textAlign: "center",
        color: "#4f46e5",
        marginBottom: "24px",
      }}
    >
      Nguyễn Minh Dũng 23520333 - Lab03
    </h1>

    <Counter initialCount={0} />
    <TodoApp />
    <Dashboard />
    
    {/* Component Library Demo */}
    <div style={{ marginTop: "40px", paddingTop: "40px", borderTop: "2px solid #e5e7eb" }}>
      <ComponentsDemo />
    </div>
  </div>
);

const root = document.getElementById("root");
if (root) mount(<App />, root);
