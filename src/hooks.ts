type CleanupFn = (() => void) | void;

let effectStates: any[] = [];
let cleanupFns: CleanupFn[] = [];
let refStates: any[] = [];
let pendingEffects: (() => CleanupFn)[] = [];
let effectIndex = 0;
let refIndex = 0;

export function resetHooks() {
  effectIndex = 0;
  refIndex = 0;
}

export function useEffect(effect: () => CleanupFn, deps?: any[]) {
  const currentIndex = effectIndex;
  const prevDeps = effectStates[currentIndex];
  let hasChanged = true;

  if (deps && prevDeps) {
    hasChanged = deps.some((dep, i) => dep !== prevDeps[i]);
  }

  if (hasChanged) {
    if (cleanupFns[currentIndex]) cleanupFns[currentIndex]!();
    pendingEffects.push(() => {
      const cleanup = effect();
      cleanupFns[currentIndex] = cleanup;
    });
    effectStates[currentIndex] = deps;
  }

  effectIndex++;
}

export function useRef<T>(initialValue: T | null) {
  const currentIndex = refIndex;
  if (!refStates[currentIndex]) {
    refStates[currentIndex] = { current: initialValue };
  }
  const ref = refStates[currentIndex];
  refIndex++;
  return ref as { current: T | null };
}

export function runEffects() {
  const effects = [...pendingEffects];
  pendingEffects = [];
  effects.forEach((fn) => fn());
}
