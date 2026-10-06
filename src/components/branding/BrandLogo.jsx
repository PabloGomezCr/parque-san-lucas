import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import pelican from "./pelicanPaths.json";
import "./BrandLogo.scss";
export function BrandLogo({
  variant = "full",
  size = "md",
  animated = false,
  loading = false,
  onMotionChange,
  theme = "auto",
  className = "",
}) {
  const { isDark } = useTheme();
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = (event) => {
      // CSS cancels the animation, so no final iteration event will be emitted.
      if (event.matches) {
        setMoving(false);
        onMotionChange?.(false);
      }
    };
    preference.addEventListener("change", stopMotion);
    return () => preference.removeEventListener("change", stopMotion);
  }, [onMotionChange]);
  const inverse = theme === "dark" || (theme === "auto" && isDark);
  return (
    <span
      className={`brand-logo brand-logo--${variant} brand-logo--${size} ${animated && (loading || moving) ? "brand-logo--animated" : ""} ${className}`}
      data-motion={moving ? "active" : "idle"}
      data-logo-theme={inverse ? "dark" : "light"}
      role="img"
      aria-label="Monitoreo de Parques — Parque Nacional Isla San Lucas"
    >
      <span className="brand-logo__mark" aria-hidden="true">
        {animated && (
          <>
            <img
              className="brand-logo__background"
              src="/assets/branding/pelicano-loading-background.png"
              alt=""
            />
            <svg
              className="brand-logo__vector"
              viewBox={pelican.viewBox}
              aria-hidden="true"
              focusable="false"
            >
              {["wing-right", "body", "wing-left"].map((part) => (
                <g
                  key={part}
                  data-part={part}
                  className={`brand-logo__${part}`}
                  style={
                    pelican.pivots[part]
                      ? {
                          transformOrigin: `${pelican.pivots[part][0]}px ${pelican.pivots[part][1]}px`,
                        }
                      : undefined
                  }
                  onAnimationStart={
                    part === "wing-left"
                      ? () => {
                          setMoving(true);
                          onMotionChange?.(true);
                        }
                      : undefined
                  }
                  onAnimationIteration={
                    part === "wing-left"
                      ? () => {
                          if (!loading) {
                            setMoving(false);
                            onMotionChange?.(false);
                          }
                        }
                      : undefined
                  }
                  fill="white"
                  fillRule="evenodd"
                  stroke="white"
                  strokeWidth="0.25"
                  strokeLinejoin="round"
                >
                  <path d={pelican.paths[part]} />
                </g>
              ))}
            </svg>
          </>
        )}
        <img
          className="brand-logo__symbol"
          src="/assets/branding/pelicano-logo-san-lucas.png"
          alt=""
          aria-hidden="true"
          width="1254"
          height="1254"
        />
      </span>
      {variant !== "symbol" && variant !== "mark" && (
        <span className="brand-logo__text" aria-hidden="true">
          <strong>
            {variant === "compact" ? "Isla San Lucas" : "Monitoreo de Parques"}
          </strong>
          <small>
            {variant === "compact"
              ? "Parque Nacional"
              : "Parque Nacional Isla San Lucas"}
          </small>
        </span>
      )}
    </span>
  );
}
