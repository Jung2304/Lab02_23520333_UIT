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

let currentRoot: HTMLElement | null = null;
let currentVNode: VNode | null = null;
let hookStates: any[] = [];
let hookIndex = 0;

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

function setProp(el: HTMLElement, key: string, value: any) {
  if (value == null || value === false) return;
  
  // Feature 1: Refs Support - Handle both object refs and callback refs
  if (key === "ref") {
    if (typeof value === "function") {
      // Callback ref - call function with the element
      value(el);
    } else if (typeof value === "object" && "current" in value) {
      // Object ref - set current property
      value.current = el;
    }
    return;
  }

  // Event handling
  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value as EventListener);
    return;
  }

  // className handling
  if (key === "className") {
    el.setAttribute("class", String(value));
    return;
  }

  // Feature 2: CSS-in-JS Support - Handle both string and object styles
  if (key === "style") {
    if (typeof value === "string") {
      // String style: "color: red; font-size: 14px"
      el.setAttribute("style", value);
    } else if (typeof value === "object") {
      // Object style: {color: 'red', fontSize: '14px'}
      // Convert camelCase to kebab-case (backgroundColor → background-color)
      const css = Object.entries(value)
        .map(([k, v]) => {
          const kebabCase = k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          return `${kebabCase}:${v}`;
        })
        .join(";");
      el.setAttribute("style", css);
    }
    return;
  }

  // Default: set as attribute
  el.setAttribute(key, String(value));
}

export function renderToDOM(vnode: VNode | string | number | null | undefined): Node {
  // Handle null/undefined - return empty text node
  if (vnode == null) {
    return document.createTextNode("");
  }

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
}

export function mount(vnode: VNode, container: HTMLElement) {
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

export function useState<T>(initialValue: T): [() => T, (v: T) => void] {
  const idx = hookIndex;

  if (hookStates[idx] === undefined) {
    hookStates[idx] = initialValue; 
  }

  const get = () => hookStates[idx];

  const set = (v: T) => {
    hookStates[idx] = v;
    requestAnimationFrame(rerender);
  };

  hookIndex++;
  return [get, set];
}
