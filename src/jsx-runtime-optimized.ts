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

type ComponentFunction = (props: ComponentProps) => VNode | string | number | null;

let currentRoot: HTMLElement | null = null;
let currentVNode: VNode | null = null;
let hookStates: any[] = [];
let hookIndex = 0;

// ============================================
// OPTIMIZATION 1: Object Pooling
// ============================================

class VNodePool {
  private pool: VNode[] = [];
  private maxSize: number = 1000;

  acquire(
    type: string | ComponentFunction,
    props: Record<string, any>,
    children: (VNode | string | number)[]
  ): VNode {
    const vnode = this.pool.pop();
    if (vnode) {
      vnode.type = type;
      vnode.props = props;
      vnode.children = children;
      return vnode;
    }
    return { type, props, children };
  }

  release(vnode: VNode): void {
    if (this.pool.length < this.maxSize) {
      // Clear references to avoid memory leaks
      vnode.props = {};
      vnode.children = [];
      this.pool.push(vnode);
    }
  }

  clear(): void {
    this.pool = [];
  }

  getSize(): number {
    return this.pool.length;
  }
}

const vnodePool = new VNodePool();

// ============================================
// OPTIMIZATION 2: Batch DOM Updates
// ============================================

class DOMUpdateBatcher {
  private updates: (() => void)[] = [];
  private isScheduled: boolean = false;

  schedule(update: () => void): void {
    this.updates.push(update);

    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  flush(): void {
    const updates = this.updates.slice();
    this.updates = [];
    this.isScheduled = false;

    for (const update of updates) {
      update();
    }
  }

  hasPendingUpdates(): boolean {
    return this.updates.length > 0;
  }
}

const batcher = new DOMUpdateBatcher();

// ============================================
// OPTIMIZATION 3: Event Delegation
// ============================================

class EventDelegator {
  private listeners: Map<string, Map<Element, EventListener>> = new Map();
  private rootHandlers: Map<string, EventListener> = new Map();

  constructor() {
    this.setupDelegation();
  }

  private setupDelegation(): void {
    // Commonly delegated events
    const events = ["click", "input", "change", "submit", "mouseover", "mouseout"];

    for (const eventType of events) {
      const handler = (e: Event) => this.handleEvent(e);
      document.addEventListener(eventType, handler);
      this.rootHandlers.set(eventType, handler);
    }
  }

  private handleEvent(e: Event): void {
    const eventType = e.type;
    const target = e.target as Element;

    // Walk up the DOM tree to find handlers
    let element: Element | null = target;
    while (element) {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const listener = listeners.get(element);
        if (listener) {
          listener(e);
          if (e.cancelBubble) break;
        }
      }
      element = element.parentElement;
    }
  }

  register(element: Element, eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Map());
    }
    this.listeners.get(eventType)!.set(element, listener);
  }

  unregister(element: Element, eventType: string): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(element);
    }
  }

  cleanup(): void {
    for (const [eventType, handler] of this.rootHandlers) {
      document.removeEventListener(eventType, handler);
    }
    this.listeners.clear();
    this.rootHandlers.clear();
  }
}

const eventDelegator = new EventDelegator();

// ============================================
// Core JSX Functions (Optimized)
// ============================================

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

  // Use object pooling for VNodes
  return vnodePool.acquire(type, safeProps, flatChildren);
}

export function createFragment(
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  return createElement("fragment", props, ...children);
}

function setProp(el: HTMLElement, key: string, value: any) {
  if (value == null || value === false) return;

  // Refs Support
  if (key === "ref") {
    if (typeof value === "function") {
      value(el);
    } else if (typeof value === "object" && "current" in value) {
      value.current = el;
    }
    return;
  }

  // Event handling with delegation
  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    
    // Use event delegation for common events
    const delegatedEvents = ["click", "input", "change", "submit", "mouseover", "mouseout"];
    if (delegatedEvents.includes(eventName)) {
      eventDelegator.register(el, eventName, value as EventListener);
    } else {
      // Direct attachment for less common events
      el.addEventListener(eventName, value as EventListener);
    }
    return;
  }

  // className handling
  if (key === "className") {
    el.setAttribute("class", String(value));
    return;
  }

  // CSS-in-JS Support
  if (key === "style") {
    if (typeof value === "string") {
      el.setAttribute("style", value);
    } else if (typeof value === "object") {
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

  // Use batched updates
  batcher.schedule(() => {
    hookIndex = 0;
    currentRoot!.innerHTML = "";
    currentRoot!.appendChild(renderToDOM(currentVNode!));

    setTimeout(() => {
      requestAnimationFrame(() => {
        runEffects();
      });
    }, 0);
  });
}

export function useState<T>(initialValue: T): [() => T, (v: T) => void] {
  const idx = hookIndex;

  if (hookStates[idx] === undefined) {
    hookStates[idx] = initialValue;
  }

  const get = () => hookStates[idx];

  const set = (v: T) => {
    if (hookStates[idx] !== v) {
      hookStates[idx] = v;
      rerender(); // Now uses batching
    }
  };

  hookIndex++;
  return [get, set];
}

// ============================================
// Memory Management & Cleanup
// ============================================

export function cleanup(): void {
  // Clear VNode pool
  vnodePool.clear();

  // Clean up event delegator
  eventDelegator.cleanup();

  // Clear hook states
  hookStates = [];
  hookIndex = 0;

  // Clear current references
  currentRoot = null;
  currentVNode = null;
}

// ============================================
// Performance Monitoring
// ============================================

export const performanceStats = {
  getPoolSize: () => vnodePool.getSize(),
  hasPendingUpdates: () => batcher.hasPendingUpdates(),
  getHookStatesCount: () => hookStates.length,
};

// Export for debugging
if (typeof window !== "undefined") {
  (window as any).__jsxPerformance = performanceStats;
}
