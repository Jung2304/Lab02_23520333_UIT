// --- MINI HOOK SYSTEM v3.4 (Full stable) ---
// Có dependency, cleanup, và chạy effect sau render root.
let effectStates = [];
let cleanupFns = [];
let refStates = [];
let pendingEffects = [];
let effectIndex = 0;
let refIndex = 0;
/** Được JSX runtime gọi trước mỗi render component */
export function resetHooks() {
    effectIndex = 0;
    refIndex = 0;
}
/** Ghi nhận effect, sẽ chạy sau render */
export function useEffect(effect, deps) {
    const currentIndex = effectIndex;
    const prevDeps = effectStates[currentIndex];
    let hasChanged = true;
    if (deps && prevDeps) {
        hasChanged = deps.some((dep, i) => dep !== prevDeps[i]);
    }
    if (hasChanged) {
        // cleanup cũ
        if (cleanupFns[currentIndex])
            cleanupFns[currentIndex]();
        // ghi vào hàng đợi để chạy sau render
        pendingEffects.push(() => {
            const cleanup = effect();
            cleanupFns[currentIndex] = cleanup;
        });
        effectStates[currentIndex] = deps;
    }
    effectIndex++;
}
/** Tạo ref giữ giá trị qua render */
export function useRef(initialValue) {
    const currentIndex = refIndex;
    if (!refStates[currentIndex]) {
        refStates[currentIndex] = { current: initialValue };
    }
    const ref = refStates[currentIndex];
    refIndex++;
    return ref;
}
export function runEffects() {
    const effects = [...pendingEffects];
    pendingEffects = [];
    effects.forEach((fn) => fn());
}
