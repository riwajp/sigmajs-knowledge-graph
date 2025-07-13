// components/GraphLayoutControl.tsx
import { useEffect, useState } from "react";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useWorkerLayoutNoverlap } from "@react-sigma/layout-noverlap";

export type LayoutType = "forceAtlas2" | "noverlap";

interface GraphLayoutControlProps {
  layout: LayoutType;
}

export default function GraphLayoutControl({
  layout,
}: GraphLayoutControlProps) {
  const [currentLayout, setCurrentLayout] = useState(layout);

  const {
    start: fa2Start,
    stop: fa2Stop,
    kill: fa2Kill,
  } = useWorkerLayoutForceAtlas2({
    settings: { slowDown: 1, adjustSizes: true },
  });

  const {
    start: noverlapStart,
    stop: noverlapStop,
    kill: noverlapKill,
  } = useWorkerLayoutNoverlap({
    settings: { speed: 10 },
  });

  useEffect(() => {
    fa2Stop();
    noverlapStop();
    let stopTimeout: any;

    if (currentLayout === "forceAtlas2") {
      fa2Start();
      // stopTimeout = setTimeout(fa2Stop, 10000);

      console.log("ForceAtlas2 started");
    } else if (currentLayout === "noverlap") {
      noverlapStart();
      stopTimeout = setTimeout(noverlapStop, 500);

      console.log("Noverlap started");
    }

    return () => {
      fa2Stop();
      fa2Kill;
      noverlapStop();
      clearTimeout(stopTimeout);
      console.log("Layouts killed");
    };
  }, [
    currentLayout,
    fa2Start,
    fa2Stop,
    fa2Kill,
    noverlapStart,
    noverlapStop,
    noverlapKill,
  ]);

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "20px" }}>
      <button onClick={() => setCurrentLayout("forceAtlas2")}>
        ForceAtlas2
      </button>

      <button onClick={() => setCurrentLayout("noverlap")}>Noverlap</button>
    </div>
  );
}
