import { useSigma } from "@react-sigma/core";
import { useState } from "react";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { animateNodes } from "sigma/utils";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutNoverlap } from "@react-sigma/layout-noverlap";

export default function LayoutToggle() {
  const sigma = useSigma();

  const forceAtlas2 = useLayoutForceAtlas2({ iterations: 500 });
  const circularLayout = useLayoutCircular();
  const noverlapLayout = useLayoutNoverlap({ maxIterations: 500 });

  const layouts = {
    circular: circularLayout,
    forceAtlas2: forceAtlas2,
    noverlap: noverlapLayout,
  };

  const [layout, setLayout] = useState<"forceAtlas2" | "circular" | "noverlap">(
    "circular"
  );

  const handleChangeLayout = (newLayout: typeof layout) => {
    setLayout(newLayout);

    animateNodes(sigma.getGraph(), layouts[newLayout].positions(), {
      duration: 1000,
    });

    console.log("Layout changed to:", newLayout);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", left: "20px" }}>
      <div>Choose Layout:</div>
      <button onClick={() => handleChangeLayout("circular")}>Circular</button>
      <button onClick={() => handleChangeLayout("forceAtlas2")}>
        ForceAtlas2
      </button>
      <button onClick={() => handleChangeLayout("noverlap")}>Noverlap</button>
    </div>
  );
}
