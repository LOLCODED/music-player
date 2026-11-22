import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Location, useLocation, useNavigate } from "react-router-dom";
import type { PageLayer } from "../components/PageStack";
import { useIsDesktop } from "./useIsDesktop";
import {
  edgeAt, edgeSwipeDirection, shouldCommitSwipe, swipeOffsets, swipeProgress, SwipeDirection,
} from "../utils/edgeSwipe";
import { markNavigationIntent } from "../utils/navigationIntent";
import { motionAllowed } from "../utils/motion";
import { hapticImpact } from "../utils/haptics";

const IGNORED_TARGETS = ".player-area, .player-fullscreen, .modal-overlay, .letter-rail, input, textarea, select";
const ACTIVATE_PX = 8;
const SETTLE_MS = 260;
const SETTLE_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";

interface Swipe {
  direction: SwipeDirection;
  start: { x: number; y: number };
  last: { x: number; t: number };
  velocity: number;
  dx: number;
  active: boolean;
  interactive: boolean;
  topKey: string;
  underKey: string;
}

function layerElement(key: string) {
  return document.querySelector<HTMLElement>(`.page-layer[data-layer-key="${CSS.escape(key)}"]`);
}

function paint(swipe: Swipe, progress: number, settling: boolean) {
  const top = layerElement(swipe.topKey);
  const under = layerElement(swipe.underKey);
  if (!top || !under) return;
  const offsets = swipeOffsets(progress, window.innerWidth, swipe.direction);
  for (const el of [top, under]) {
    el.style.transition = settling ? `transform ${SETTLE_MS}ms ${SETTLE_EASING}` : "none";
    el.classList.toggle("settling", settling);
  }
  top.style.transform = `translateX(${offsets.top}px)`;
  under.style.transform = `translateX(${offsets.under}px)`;
  under.style.setProperty("--dim", String(offsets.dim));
}

function unpaint() {
  document.querySelectorAll<HTMLElement>(".page-layer").forEach((el) => {
    el.style.transition = "";
    el.style.transform = "";
    el.style.removeProperty("--dim");
    el.classList.remove("settling");
  });
}

function gestureLayers(direction: SwipeDirection, current: Location, neighbor: Location): PageLayer[] {
  return direction === -1
    ? [{ location: neighbor, role: "under" }, { location: current, role: "top", gesture: true }]
    : [{ location: current, role: "under" }, { location: neighbor, role: "top", gesture: true }];
}

/** Starts a swipe when a single touch lands on an edge that has history behind it. */
function beginSwipe(e: TouchEvent, current: Location, neighbor: (offset: -1 | 1) => Location | null, interactive: boolean): [Swipe, Location] | null {
  const touch = e.touches[0];
  if (!touch || e.touches.length !== 1) return null;
  if (e.target instanceof Element && e.target.closest(IGNORED_TARGETS)) return null;
  const direction = edgeAt(touch.clientX, window.innerWidth);
  if (direction === 0) return null;
  const target = neighbor(direction);
  if (!target) return null;
  const [under, top] = direction === -1 ? [target, current] : [current, target];
  return [{
    direction,
    start: { x: touch.clientX, y: touch.clientY },
    last: { x: touch.clientX, t: e.timeStamp },
    velocity: 0,
    dx: 0,
    active: false,
    interactive,
    topKey: top.key,
    underKey: under.key,
  }, target];
}

interface SwipeContext {
  current: () => Location;
  neighbor: (offset: -1 | 1) => Location | null;
  interactive: () => boolean;
  showLayers: (layers: PageLayer[] | null) => void;
  navigate: (delta: number) => void;
  commit: (direction: SwipeDirection) => void;
}

interface SwipeState {
  swipe: Swipe | null;
  frame: number;
}

function handleMove(state: SwipeState, e: TouchEvent, ctx: SwipeContext) {
  const swipe = state.swipe;
  const touch = e.touches[0];
  if (!swipe || !touch) return;
  const dx = touch.clientX - swipe.start.x;
  const dy = touch.clientY - swipe.start.y;
  if (!swipe.active) {
    if (Math.abs(dx) < ACTIVATE_PX && Math.abs(dy) < ACTIVATE_PX) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.5 || -swipe.direction * dx <= 0) {
      state.swipe = null;
      return;
    }
    swipe.active = true;
    const target = swipe.interactive ? ctx.neighbor(swipe.direction) : null;
    if (target) ctx.showLayers(gestureLayers(swipe.direction, ctx.current(), target));
  }
  e.preventDefault();
  swipe.velocity = (touch.clientX - swipe.last.x) / Math.max(1, e.timeStamp - swipe.last.t);
  swipe.last = { x: touch.clientX, t: e.timeStamp };
  swipe.dx = dx;
  if (!swipe.interactive) return;
  cancelAnimationFrame(state.frame);
  state.frame = requestAnimationFrame(() => paint(swipe, swipeProgress(swipe.dx, window.innerWidth, swipe.direction), false));
}

function handleEnd(state: SwipeState, e: TouchEvent, ctx: SwipeContext) {
  const ended = state.swipe;
  state.swipe = null;
  if (!ended?.active) return;
  cancelAnimationFrame(state.frame);
  if (!ended.interactive) {
    const touch = e.changedTouches[0];
    const direction = touch && edgeSwipeDirection(ended.start, { x: touch.clientX, y: touch.clientY }, window.innerWidth);
    if (direction) ctx.navigate(direction);
    return;
  }
  const progress = swipeProgress(ended.dx, window.innerWidth, ended.direction);
  const commit = shouldCommitSwipe(progress, ended.velocity, ended.direction);
  paint(ended, commit ? 1 : 0, true);
  window.setTimeout(() => {
    if (commit) return ctx.commit(ended.direction);
    ctx.showLayers(null);
    unpaint();
  }, SETTLE_MS);
}

function attachEdgeSwipe(ctx: SwipeContext): () => void {
  const state: SwipeState = { swipe: null, frame: 0 };
  const onStart = (e: TouchEvent) => {
    state.swipe = beginSwipe(e, ctx.current(), ctx.neighbor, ctx.interactive())?.[0] ?? null;
  };
  const onMove = (e: TouchEvent) => handleMove(state, e, ctx);
  const onEnd = (e: TouchEvent) => handleEnd(state, e, ctx);
  window.addEventListener("touchstart", onStart, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onEnd, { passive: true });
  window.addEventListener("touchcancel", onEnd, { passive: true });
  return () => {
    cancelAnimationFrame(state.frame);
    window.removeEventListener("touchstart", onStart);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onEnd);
    window.removeEventListener("touchcancel", onEnd);
  };
}

/**
 * iOS-style edge swipes: from the left edge back, from the right edge forward. With motion on
 * (phone layout) the page follows the finger with the neighbouring page mounted beneath; with
 * motion off, or on the desktop layout, a completed swipe just navigates.
 */
export function useInteractiveEdgeSwipe(neighbor: (offset: -1 | 1) => Location | null): PageLayer[] | null {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [layers, setLayers] = useState<PageLayer[] | null>(null);
  const locationRef = useRef(location);
  const awaitingNavigation = useRef(false);
  locationRef.current = location;

  // A committed swipe keeps its layers until the navigation lands, so the page beneath never remounts.
  useLayoutEffect(() => {
    if (!awaitingNavigation.current) return;
    awaitingNavigation.current = false;
    setLayers(null);
    unpaint();
  }, [location.key]);

  useEffect(() => attachEdgeSwipe({
    current: () => locationRef.current,
    neighbor,
    interactive: () => !isDesktop && motionAllowed(),
    showLayers: setLayers,
    navigate,
    commit: (direction) => {
      markNavigationIntent("gesture");
      hapticImpact();
      awaitingNavigation.current = true;
      navigate(direction);
    },
  }), [navigate, neighbor, isDesktop]);

  return layers;
}
