/** @jsx createElement */
import { createElement, mount } from "./jsx-runtime";
import { Counter } from "./counter";
import { TodoApp } from "./todo-app";
import { Dashboard } from "./dashboard";
import "./style.css";
const App = () => (createElement("div", null,
    createElement("h1", { style: {
            textAlign: "center",
            color: "#4f46e5",
            marginBottom: "24px",
        } }, "Nguy\u1EC5n Minh D\u0169ng 23520333 - Lab02"),
    createElement(Counter, { initialCount: 0 }),
    createElement(TodoApp, null),
    createElement(Dashboard, null)));
// --- Mount app ---
const root = document.getElementById("root");
if (root)
    mount(createElement(App, null), root);
