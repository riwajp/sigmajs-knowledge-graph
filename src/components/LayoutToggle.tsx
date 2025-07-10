// components/LayoutToggle.tsx
import { useGraphLayout, type LayoutType } from "../hooks/useGraphLayout";

export default function LayoutToggle() {
  const { runLayouts, currentLayout, isLayoutRunning } = useGraphLayout();

  const handleClick = (layout: LayoutType) => {
    runLayouts(layout);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "20px" }}>
      <div>Choose Layout:</div>
      <button
        onClick={() => handleClick("circular")}
        disabled={currentLayout === "circular"}
      >
        Circular
      </button>
      <button
        onClick={() => handleClick("forceAtlas2")}
        disabled={currentLayout === "forceAtlas2"}
      >
        ForceAtlas2
      </button>
      <button
        onClick={() => handleClick("noverlap")}
        disabled={currentLayout === "noverlap"}
      >
        Noverlap
      </button>

      <div style={{ marginTop: "8px" }}>
        <strong>Current:</strong> {currentLayout}
        <br />
        <strong>State: {isLayoutRunning ? "Loading" : "Completed"}</strong>{" "}
      </div>
    </div>
  );
}
