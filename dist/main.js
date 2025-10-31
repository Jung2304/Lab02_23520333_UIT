// src/hooks.ts
var effectStates = [];
var cleanupFns = [];
var refStates = [];
var pendingEffects = [];
var effectIndex = 0;
var refIndex = 0;
function useEffect(effect, deps) {
  const currentIndex = effectIndex;
  const prevDeps = effectStates[currentIndex];
  let hasChanged = true;
  if (deps && prevDeps) {
    hasChanged = deps.some((dep, i) => dep !== prevDeps[i]);
  }
  if (hasChanged) {
    if (cleanupFns[currentIndex]) cleanupFns[currentIndex]();
    pendingEffects.push(() => {
      const cleanup = effect();
      cleanupFns[currentIndex] = cleanup;
    });
    effectStates[currentIndex] = deps;
  }
  effectIndex++;
}
function useRef(initialValue) {
  const currentIndex = refIndex;
  if (!refStates[currentIndex]) {
    refStates[currentIndex] = { current: initialValue };
  }
  const ref = refStates[currentIndex];
  refIndex++;
  return ref;
}
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
function mount(vnode, container) {
  currentRoot = container;
  currentVNode = vnode;
  hookIndex = 0;
  container.innerHTML = "";
  container.appendChild(renderToDOM(vnode));
  setTimeout(() => {
    requestAnimationFrame(() => {
      runEffects();
    });
  }, 0);
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

// src/counter.tsx
var Button = ({ onClick, children }) => /* @__PURE__ */ createElement("button", { onClick }, children);
var Counter = ({ initialCount = 0 }) => {
  const [getCount, setCount] = useState(initialCount);
  const inc = () => setCount(getCount() + 1);
  const dec = () => setCount(getCount() - 1);
  const reset = () => setCount(initialCount);
  return /* @__PURE__ */ createElement("div", { style: { textAlign: "center", padding: "20px" } }, /* @__PURE__ */ createElement("h2", { style: { marginBottom: "12px" } }, "Count: ", getCount()), /* @__PURE__ */ createElement("div", { style: { display: "flex", gap: "8px", justifyContent: "center" } }, /* @__PURE__ */ createElement(Button, { onClick: inc }, "+"), /* @__PURE__ */ createElement(Button, { onClick: dec }, "\u2212"), /* @__PURE__ */ createElement(Button, { onClick: reset }, "Reset")));
};

// src/todo-app.tsx
var TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [getInput] = useState({ currentValue: "" });
  const [filter, setFilter] = useState("all");
  const handleAdd = () => {
    const text = getInput.currentValue?.trim() || "";
    if (!text) return;
    setTodos([...todos(), { id: Date.now(), text, completed: false }]);
    getInput.currentValue = "";
    const inputEl = getInput.ref;
    if (inputEl) inputEl.value = "";
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
  return /* @__PURE__ */ createElement(
    "div",
    {
      style: {
        marginTop: "32px",
        padding: "20px",
        background: "#111827",
        borderRadius: "12px",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        color: "#f3f4f6"
      }
    },
    /* @__PURE__ */ createElement(
      "h2",
      {
        style: {
          marginBottom: "16px",
          color: "#e5e7eb",
          fontSize: "20px",
          textAlign: "center"
        }
      },
      "\u{1F9FE} Todo Tracker (Dark)"
    ),
    /* @__PURE__ */ createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          alignItems: "center"
        }
      },
      /* @__PURE__ */ createElement(
        "input",
        {
          defaultValue: "",
          ref: (el) => getInput.ref = el,
          onInput: (e) => getInput.currentValue = e.target.value,
          placeholder: "Add a task...",
          style: {
            flex: 1,
            borderRadius: "6px",
            border: "1px solid #374151",
            background: "#1f2937",
            color: "#f9fafb",
            padding: "8px",
            fontSize: "14px"
          }
        }
      ),
      /* @__PURE__ */ createElement(
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
      )
    ),
    /* @__PURE__ */ createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }
      },
      /* @__PURE__ */ createElement("span", { style: { color: "#9ca3af", fontSize: "13px" } }, "\u2705 ", stats.completed, " / ", stats.total, " done"),
      /* @__PURE__ */ createElement("div", { style: { display: "flex", gap: "6px" } }, ["all", "active", "completed"].map((type) => /* @__PURE__ */ createElement(
        "button",
        {
          key: type,
          onClick: () => setFilter(type),
          style: {
            background: filter() === type ? "#4f46e5" : "#1f2937",
            color: filter() === type ? "#fff" : "#d1d5db",
            border: "1px solid #374151",
            borderRadius: "6px",
            padding: "4px 10px",
            cursor: "pointer"
          }
        },
        type.charAt(0).toUpperCase() + type.slice(1)
      )))
    ),
    /* @__PURE__ */ createElement("ul", { style: { listStyle: "none", padding: 0, margin: 0 } }, filteredTodos.length === 0 ? /* @__PURE__ */ createElement(
      "li",
      {
        style: {
          textAlign: "center",
          color: "#6b7280",
          padding: "10px 0"
        }
      },
      "Nothing here"
    ) : filteredTodos.map((t) => /* @__PURE__ */ createElement(
      "li",
      {
        key: t.id,
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          padding: "10px 12px",
          borderRadius: "8px",
          background: "#1f2937",
          border: "1px solid #374151"
        }
      },
      /* @__PURE__ */ createElement(
        "span",
        {
          onClick: () => handleToggle(t.id),
          style: {
            textDecoration: t.completed ? "line-through" : "none",
            color: t.completed ? "#6b7280" : "#f9fafb",
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
            background: "#dc2626",
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
    )))
  );
};

// src/data-service.ts
var DataService = {
  generate() {
    const carBrands = ["Toyota", "Honda", "Ford", "BMW", "Tesla", "Hyundai"];
    const regions = ["Asia", "Europe", "America"];
    const year = 2025;
    return carBrands.map((brand) => ({
      label: brand,
      value: Math.floor(Math.random() * 5e4) + 1e4,
      // 10k–60k xe
      region: regions[Math.floor(Math.random() * regions.length)],
      year
    }));
  }
};

// src/component.tsx
var Card = ({ title, children }) => {
  return /* @__PURE__ */ createElement(
    "div",
    {
      style: {
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)"
      }
    },
    title && /* @__PURE__ */ createElement("div", { style: { fontWeight: 600, marginBottom: "8px", color: "#111827" } }, title),
    /* @__PURE__ */ createElement("div", null, children)
  );
};

// src/chart.tsx
var PALETTE = [
  "#EE6055",
  "#17BEBB",
  "#AAF683",
  "#FFD97D",
  "#FF9B85",
  "#3B3C8A"
];
var Chart = ({ data, type, width = 600, height = 350 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("\u26A0\uFE0F Canvas not found!");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);
    switch (type) {
      case "bar":
        drawBarChart(ctx, data, width, height);
        break;
      case "line":
        drawLineChart(ctx, data, width, height);
        break;
      case "pie":
        drawPieChart(ctx, data, width, height);
        break;
    }
  }, [data, type]);
  const renderLegend = () => /* @__PURE__ */ createElement(
    "div",
    {
      style: {
        marginTop: "12px",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "12px"
      }
    },
    data.map((d, i) => /* @__PURE__ */ createElement(
      "div",
      {
        key: i,
        style: { display: "flex", alignItems: "center", gap: "6px" }
      },
      /* @__PURE__ */ createElement(
        "div",
        {
          style: {
            width: "14px",
            height: "14px",
            background: PALETTE[i % PALETTE.length],
            borderRadius: "3px"
          }
        }
      ),
      /* @__PURE__ */ createElement("span", { style: { fontSize: "13px", color: "#374151" } }, d.label)
    ))
  );
  return /* @__PURE__ */ createElement("div", { style: { position: "relative", textAlign: "center" } }, /* @__PURE__ */ createElement(
    "canvas",
    {
      ref: canvasRef,
      width,
      height,
      style: { borderRadius: "10px" }
    }
  ), type !== "bar" && renderLegend());
};
function drawBarChart(ctx, data, width, height) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const barWidth = width / data.length - 20;
  data.forEach((d, i) => {
    const barHeight = d.value / maxVal * (height - 80);
    const x = i * (barWidth + 20);
    const y = height - barHeight - 30;
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 6);
    ctx.fill();
    ctx.fillStyle = "#111827";
    ctx.font = "13px Montserrat";
    ctx.textAlign = "center";
    ctx.fillText(d.value.toString(), x + barWidth / 2, y - 6);
    ctx.fillStyle = "#374151";
    ctx.font = "13px Montserrat";
    ctx.fillText(d.label, x + barWidth / 2, height - 10);
  });
}
function drawLineChart(ctx, data, width, height) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const gap = width / (data.length - 1);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(23,190,187,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.moveTo(0, height);
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - d.value / maxVal * (height - 80);
    if (i === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "#17BEBB";
  ctx.lineWidth = 3;
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - d.value / maxVal * (height - 80);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  data.forEach((d, i) => {
    const x = i * gap;
    const y = height - d.value / maxVal * (height - 80);
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}
function drawPieChart(ctx, data, width, height) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = Math.min(width, height) / 3;
  let startAngle = 0;
  data.forEach((d, i) => {
    const sliceAngle = d.value / total * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(width / 2, height / 2, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    startAngle += sliceAngle;
  });
}

// src/dashboard.tsx
var Dashboard = () => {
  const [getData, setData] = useState(DataService.generate());
  const refresh = () => setData(DataService.generate());
  const data = getData();
  console.log("Dashboard rendering", getData());
  const handleHover = (e) => {
    e.target.style.background = "#4338ca";
  };
  const handleOut = (e) => {
    e.target.style.background = "#4f46e5";
  };
  return /* @__PURE__ */ createElement("div", { style: { maxWidth: "800px", margin: "0 auto" } }, /* @__PURE__ */ createElement(
    "h2",
    {
      style: {
        textAlign: "center",
        marginBottom: "24px",
        color: "#111827",
        fontWeight: "600"
      }
    },
    "Dashboard - Car Sales Random"
  ), /* @__PURE__ */ createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        // 👈 Xếp dọc
        gap: "16px",
        marginBottom: "24px"
      }
    },
    /* @__PURE__ */ createElement(Card, { title: "Bar Chart" }, /* @__PURE__ */ createElement(Chart, { data, type: "bar" })),
    /* @__PURE__ */ createElement(Card, { title: "Line Chart" }, /* @__PURE__ */ createElement(Chart, { data, type: "line" })),
    /* @__PURE__ */ createElement(Card, { title: "Pie Chart" }, /* @__PURE__ */ createElement(Chart, { data, type: "pie" }))
  ), /* @__PURE__ */ createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ createElement(
    "button",
    {
      onClick: refresh,
      onMouseOver: handleHover,
      onMouseOut: handleOut,
      style: {
        background: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "0.2s"
      }
    },
    "\u{1F504} Refresh Data"
  )));
};

// src/main.tsx
var App = () => /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement(
  "h1",
  {
    style: {
      textAlign: "center",
      color: "#4f46e5",
      marginBottom: "24px"
    }
  },
  "Nguy\u1EC5n Minh D\u0169ng 23520333 - Lab02"
), /* @__PURE__ */ createElement(Counter, { initialCount: 0 }), /* @__PURE__ */ createElement(TodoApp, null), /* @__PURE__ */ createElement(Dashboard, null));
var root = document.getElementById("root");
if (root) mount(/* @__PURE__ */ createElement(App, null), root);
