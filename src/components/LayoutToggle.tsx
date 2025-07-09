import { useSigma } from "@react-sigma/core";
import { useState } from "react";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { animateNodes } from "sigma/utils";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";

export default function LayoutToggle() {
  const [layout, setLayout] = useState<"forceAtlas2" | "circular">("circular");
  const sigma = useSigma();
  const forceAtlas2 = useLayoutForceAtlas2({ iterations: 500 });
  const circularLayout = useLayoutCircular();

  const layouts = {
    forceAtlas2: forceAtlas2,
    circular: circularLayout,
  };
  const handleClick = () => {
    const newLayout = layout == "forceAtlas2" ? "circular" : "forceAtlas2";

    setLayout(newLayout);

    // layouts[newLayout].assign(sigma.getGraph(), 100);

    animateNodes(sigma.getGraph(), layouts[newLayout].positions(), {
      duration: 1000,
    });
    console.log("Layout changed to:", newLayout);
  };

  return (
    <div>
      Click the button below to toggle the layout:
      <br />
      <button onClick={handleClick}>{layout}</button>
    </div>
  );
}
