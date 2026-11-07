import Lenis from "lenis";

// Short interpolation tail: softer wheel input and controlled touch inertia.
// Keep these settings together so the feel can be tuned without changing navigation.
const options = {
  autoRaf: true,
  smoothWheel: true,
  lerp: 0.085,
  wheelMultiplier: 0.9,
  syncTouch: true,
  syncTouchLerp: 0.075,
  touchMultiplier: 0.9,
  touchInertiaExponent: 1.45,
  anchors: true,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
  respectReducedMotion: false,
  // Leave multi-finger gestures to the browser (for example, pinch to zoom).
  virtualScroll: ({ event }: { event: TouchEvent | WheelEvent }) =>
    !("touches" in event && event.touches.length > 1),
};

let scroller: Lenis | undefined;
const initialize = () => {
  scroller ??= new Lenis(options);
};

initialize();
window.addEventListener("pagehide", () => {
  scroller?.destroy();
  scroller = undefined;
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) initialize();
});
