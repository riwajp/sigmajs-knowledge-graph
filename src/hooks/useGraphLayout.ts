import { useSigma } from "@react-sigma/core";
import { animateNodes } from "sigma/utils";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutNoverlap } from "@react-sigma/layout-noverlap";
import { useCallback, useState } from "react";

export type LayoutType = "circular" | "forceAtlas2" | "noverlap";

export function useGraphLayout() {
  const sigma = useSigma();
  const [currentLayout, setCurrentLayout] = useState<LayoutType | null>(null);
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);

  const circular = useLayoutCircular();
  const forceAtlas2 = useLayoutForceAtlas2({ iterations: 500 });
  const noverlap = useLayoutNoverlap({ maxIterations: 500 });

  const runLayouts = useCallback(
    (layoutSequence: LayoutType | LayoutType[], duration = 1000) => {
      const layouts = { circular, forceAtlas2, noverlap };
      const graph = sigma.getGraph();
      if (!graph) return;

      setIsLayoutRunning(true);

      const sequence = Array.isArray(layoutSequence)
        ? layoutSequence
        : [layoutSequence];

      let chain: Promise<any> = Promise.resolve();

      sequence.forEach((layoutName) => {
        const layout = layouts[layoutName];
        if (!layout) return;

        chain = chain.then(() => {
          const positions = layout.positions();
          return animateNodes(graph, positions, { duration });
        });
      });

      chain.finally(() => {
        setIsLayoutRunning(false);
      });
    },
    [sigma, circular, forceAtlas2, noverlap]
  );

  return { currentLayout, runLayouts, isLayoutRunning };
}
