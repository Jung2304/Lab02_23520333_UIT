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
function createFragment(props, ...children) {
  return createElement("fragment", props, ...children);
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
export {
  createElement,
  createFragment,
  mount,
  renderToDOM,
  useState
};
