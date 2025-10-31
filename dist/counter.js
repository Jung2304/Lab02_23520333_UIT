/** @jsx createElement */
import { createElement, useState } from "./jsx-runtime";
const Button = ({ onClick, children }) => (createElement("button", { onClick: onClick }, children));
const Counter = ({ initialCount = 0 }) => {
    const [getCount, setCount] = useState(initialCount);
    const inc = () => setCount(getCount() + 1);
    const dec = () => setCount(getCount() - 1);
    const reset = () => setCount(initialCount);
    return (createElement("div", { style: { textAlign: "center", padding: "20px" } },
        createElement("h2", { style: { marginBottom: "12px" } },
            "Count: ",
            getCount()),
        createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "center" } },
            createElement(Button, { onClick: inc }, "+"),
            createElement(Button, { onClick: dec }, "\u2212"),
            createElement(Button, { onClick: reset }, "Reset"))));
};
export { Counter };
