// --- MINI JSX RUNTIME v3.3 (stable) ---
import { resetHooks, runEffects } from "./hooks";

export interface VNode {
  type: string | ComponentFunction;
  props: Record<string, any>;
  children: (VNode | string | number)[];
}

interface ComponentProps {
  children?: (VNode | string | number)[];
  [key: string]: any;
}

type ComponentFunction = (props: ComponentProps) => VNode | string | number;

// ---------- GLOBALS ----------
let currentRoot: HTMLElement | null = null;
let currentVNode: VNode | null = null;
let hookStates: any[] = [];
let hookIndex = 0;

// ---------- ELEMENT CREATION ----------
export function createElement(
  type: string | ComponentFunction,
  props: Record<string, any> | null,
  ...children: (VNode | string | number | boolean | null | undefined)[]
): VNode {
  const flatChildren = children
    .flat()
    .filter((c): c is VNode | string | number => c != null && c !== false);
  const safeProps = props ? { ...props } : {};
  (safeProps as ComponentProps).children = flatChildren;
  return { type, props: safeProps, children: flatChildren };
}

export function createFragment(
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  return createElement("fragment", props, ...children);
}

// ---------- RENDER ----------
function setProp(el: HTMLElement, key: string, value: any) {
  if (value == null || value === false) return;
  // ✅ THÊM ĐOẠN NÀY
  if (key === "ref" && typeof value === "object" && "current" in value) {
    value.current = el;
    return;
  }

  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value as EventListener);
    return;
  }

  if (key === "className") {
    el.setAttribute("class", String(value));
    return;
  }

  if (key === "style") {
    if (typeof value === "string") el.setAttribute("style", value);
    else if (typeof value === "object") {
      const css = Object.entries(value)
        .map(
          ([k, v]) =>
            `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`
        )
        .join(";");
      el.setAttribute("style", css);
    }
    return;
  }

  el.setAttribute(key, String(value));
}

export function renderToDOM(vnode: VNode | string | number): Node {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  if (typeof vnode.type === "function") {
    const out = (vnode.type as ComponentFunction)(vnode.props);
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

// ---------- MOUNT & RERENDER ----------
export function mount(vnode: VNode, container: HTMLElement) {
  currentRoot = container;
  currentVNode = vnode;
  hookIndex = 0;
  container.innerHTML = "";
  container.appendChild(renderToDOM(vnode));

  // ✅ Đảm bảo useEffect chỉ chạy sau khi DOM đã paint
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

  // ✅ tương tự như trên
  setTimeout(() => {
    requestAnimationFrame(() => {
      runEffects();
    });
  }, 0);
}

// ---------- HOOKS ----------
export function useState<T>(initialValue: T): [() => T, (v: T) => void] {
  const idx = hookIndex;

  if (hookStates[idx] === undefined) {
    hookStates[idx] = initialValue; // giữ lại giữa các lần render
  }

  const get = () => hookStates[idx];

  const set = (v: T) => {
    hookStates[idx] = v;
    // async để tránh re-render lồng
    requestAnimationFrame(rerender);
  };

  hookIndex++;
  return [get, set];
}
