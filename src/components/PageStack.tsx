import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Location, useLocation, useNavigationType } from "react-router-dom";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { classifyNavigation, isTabNavigationState, PageTransition } from "../utils/pageTransition";
import { consumeNavigationIntent } from "../utils/navigationIntent";
import { motionAllowed } from "../utils/motion";

export interface PageLayer {
  location: Location;
  role: "top" | "under" | "enter-push" | "exit-push" | "enter-pop" | "exit-pop";
  gesture?: boolean;
}

interface PageStackProps {
  renderRoutes: (location: Location) => React.ReactNode;
  /** Layers a swipe gesture is driving; while set they replace the resting stack. */
  gestureLayers?: PageLayer[] | null;
}

function layersFor(transition: PageTransition, from: Location | null, to: Location): PageLayer[] {
  if (transition === "none" || !from || from.key === to.key) return [{ location: to, role: "top" }];
  if (transition === "push") return [{ location: from, role: "exit-push" }, { location: to, role: "enter-push" }];
  return [{ location: to, role: "enter-pop" }, { location: from, role: "exit-pop" }];
}

/** Keeps the outgoing page mounted while the incoming one slides over or under it. */
function useTransitionLayers(): [PageLayer[], () => void] {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isDesktop = useIsDesktop();
  const previous = useRef<Location | null>(null);
  const [layers, setLayers] = useState<PageLayer[]>([{ location, role: "top" }]);

  useLayoutEffect(() => {
    const intent = consumeNavigationIntent();
    const transition = classifyNavigation(navigationType, {
      animate: !isDesktop && motionAllowed(),
      tabSwitch: isTabNavigationState(location.state),
      appBack: intent === "back",
    });
    setLayers(layersFor(transition, previous.current, location));
    previous.current = location;
    // Only a new history entry starts a transition; other dependencies are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const settle = useCallback(() => setLayers([{ location: previous.current ?? location, role: "top" }]), [location]);
  return [layers, settle];
}

const PageStack: React.FC<PageStackProps> = ({ renderRoutes, gestureLayers }) => {
  const [layers, settle] = useTransitionLayers();
  const shown = gestureLayers ?? layers;

  return (
    <>
      {shown.map(({ location, role, gesture }) => (
        <div
          key={location.key}
          data-layer-key={location.key}
          className={`page-layer page-layer-${role}${gesture ? " page-layer-gesture" : ""}`}
          aria-hidden={role === "top" || role.startsWith("enter") ? undefined : true}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && role.startsWith("enter")) settle();
          }}
        >
          {renderRoutes(location)}
        </div>
      ))}
    </>
  );
};

export default PageStack;
