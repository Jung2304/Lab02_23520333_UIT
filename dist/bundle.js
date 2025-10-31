// src/hooks.ts
var pendingEffects = [];
function runEffects() {
  const effects = [...pendingEffects];
  pendingEffects = [];
  effects.forEach((fn) => fn());
}

// src/jsx-runtime.ts
var currentRoot = null;
var currentVNode = null;
var hookStates = [];
var hookIndex = 0;
function createElement(type, props, ...children) {
  const flatChildren = children.flat().filter((c) => c != null && c !== false);
  const safeProps = props ? { ...props } : {};
  safeProps.children = flatChildren;
  return { type, props: safeProps, children: flatChildren };
}
function setProp(el, key, value) {
  if (value == null || value === false) return;
  if (key === "ref" && typeof value === "object" && "current" in value) {
    value.current = el;
    return;
  }
  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value);
    return;
  }
  if (key === "className") {
    el.setAttribute("class", String(value));
    return;
  }
  if (key === "style") {
    if (typeof value === "string") el.setAttribute("style", value);
    else if (typeof value === "object") {
      const css = Object.entries(value).map(
        ([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`
      ).join(";");
      el.setAttribute("style", css);
    }
    return;
  }
  el.setAttribute(key, String(value));
}
function renderToDOM(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }
  if (typeof vnode.type === "function") {
    const out = vnode.type(vnode.props);
    return renderToDOM(out);
  }
  if (vnode.type === "fragment") {
    const frag = document.createDocumentFragment();
    vnode.children.forEach((child) => frag.appendChild(renderToDOM(child)));
    return frag;
  }
  const el = document.createElement(vnode.type);
  for (const [k, v] of Object.entries(vnode.props || {})) setProp(el, k, v);
  vnode.children.forEach((child) => el.appendChild(renderToDOM(child)));
  return el;
  console.log("renderToDOM:", vnode);
}
function rerender() {
  if (!currentRoot || !currentVNode) return;
  hookIndex = 0;
  currentRoot.innerHTML = "";
  currentRoot.appendChild(renderToDOM(currentVNode));
  setTimeout(() => {
    requestAnimationFrame(() => {
      runEffects();
    });
  }, 0);
}
function useState(initialValue) {
  const idx = hookIndex;
  if (hookStates[idx] === void 0) {
    hookStates[idx] = initialValue;
  }
  const get = () => hookStates[idx];
  const set = (v) => {
    hookStates[idx] = v;
    requestAnimationFrame(rerender);
  };
  hookIndex++;
  return [get, set];
}

// src/todo-app.tsx
var TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    setTodos([...todos(), { id: Date.now(), text, completed: false }]);
    setInput("");
  };
  const handleToggle = (id) => setTodos(
    todos().map(
      (t) => t.id === id ? { ...t, completed: !t.completed } : t
    )
  );
  const handleDelete = (id) => setTodos(todos().filter((t) => t.id !== id));
  const filteredTodos = filter() === "active" ? todos().filter((t) => !t.completed) : filter() === "completed" ? todos().filter((t) => t.completed) : todos();
  const stats = {
    completed: todos().filter((t) => t.completed).length,
    total: todos().length
  };
  return /* @__PURE__ */ createElement("div", { style: { marginTop: "32px" } }, /* @__PURE__ */ createElement("h2", { style: { marginBottom: "12px", color: "#111827" } }, "\u{1F9FE} Todo Tracker"), /* @__PURE__ */ createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" } }, /* @__PURE__ */ createElement(
    "input",
    {
      value: input(),
      onInput: (e) => setInput(e.target.value),
      placeholder: "Add a task...",
      style: {
        flex: 1,
        borderRadius: "6px",
        border: "1px solid #ccc",
        padding: "8px",
        fontSize: "14px"
      }
    }
  ), /* @__PURE__ */ createElement(
    "button",
    {
      onClick: handleAdd,
      style: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        cursor: "pointer"
      }
    },
    "Add"
  )), /* @__PURE__ */ createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
      }
    },
    /* @__PURE__ */ createElement("span", { style: { color: "#6b7280" } }, "\u2705 ", stats.completed, " / ", stats.total, " done"),
    /* @__PURE__ */ createElement("div", { style: { display: "flex", gap: "6px" } }, ["all", "active", "completed"].map((type) => /* @__PURE__ */ createElement(
      "button",
      {
        key: type,
        onClick: () => setFilter(type),
        style: {
          background: filter() === type ? "#2563eb" : "#e5e7eb",
          color: filter() === type ? "#fff" : "#111",
          border: "none",
          borderRadius: "6px",
          padding: "4px 10px",
          cursor: "pointer"
        }
      },
      type.charAt(0).toUpperCase() + type.slice(1)
    )))
  ), /* @__PURE__ */ createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0 } }, filteredTodos.length === 0 ? /* @__PURE__ */ createElement("li", { style: { textAlign: "center", color: "#6b7280" } }, "Nothing here") : filteredTodos.map((t) => /* @__PURE__ */ createElement(
    "li",
    {
      key: t.id,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        padding: "8px 12px",
        borderRadius: "8px",
        background: "#f9fafb"
      }
    },
    /* @__PURE__ */ createElement(
      "span",
      {
        onClick: () => handleToggle(t.id),
        style: {
          textDecoration: t.completed ? "line-through" : "none",
          color: t.completed ? "#9ca3af" : "#111827",
          cursor: "pointer",
          flex: 1
        }
      },
      t.text
    ),
    /* @__PURE__ */ createElement(
      "button",
      {
        onClick: () => handleDelete(t.id),
        style: {
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "4px 8px",
          fontSize: "12px",
          cursor: "pointer"
        }
      },
      "Delete"
    )
  ))));
};
export {
  TodoApp
};
