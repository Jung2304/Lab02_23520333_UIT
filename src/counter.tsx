/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";

interface ButtonProps {
  onClick: () => void;
  children?: any;
}

const Button = ({ onClick, children }: ButtonProps) => (
  <button onClick={onClick}>{children}</button>
);

interface CounterProps {
  initialCount?: number;
}

const Counter = ({ initialCount = 0 }: CounterProps) => {
  const [getCount, setCount] = useState(initialCount);
  const inc = () => setCount(getCount() + 1);
  const dec = () => setCount(getCount() - 1);
  const reset = () => setCount(initialCount);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={{ marginBottom: "12px" }}>Count: {getCount()}</h2>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <Button onClick={inc}>+</Button>
        <Button onClick={dec}>−</Button>
        <Button onClick={reset}>Reset</Button>
      </div>
    </div>
  );
};

export { Counter };
