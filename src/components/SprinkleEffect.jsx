import React, { useEffect } from "react";

const SprinkleEffect = ({ trigger }) => {
  useEffect(() => {
    if (!trigger) return; // do nothing if trigger is null

    const { x, y } = trigger;

    // Create multiple spark dots
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement("span");
      dot.classList.add("spark");

      // Fixed positioning so it appears at correct spot
      dot.style.position = "fixed";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.pointerEvents = "none"; // prevent interference with clicks
      document.body.appendChild(dot);

      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 30 + 10;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      dot.animate(
        [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
        ],
        { duration: 700, easing: "ease-out" }
      );

      // Remove dot after animation
      setTimeout(() => dot.remove(), 700);
    }
  }, [trigger]);

  return null; // nothing to render
};

export default SprinkleEffect;


