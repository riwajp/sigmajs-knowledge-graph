// components/GraphLoader.tsx
import { useEffect, useState } from "react";
import Graph from "graphology";
import gexf from "graphology-gexf";
import { useRegisterEvents, useSetSettings, useSigma } from "@react-sigma/core";

import "@react-sigma/core/lib/style.css";

import { useGraphLayout, type LayoutType } from "../hooks/useGraphLayout";
import { drawNodeHover, drawNodeLabel } from "../utils/drawNodeFunctions";

import { circular } from "graphology-layout";
import { LoadingScreen } from "./LoadingScreen";

export default function GraphLoader({
  gexfData,
  initialLayout,
}: {
  gexfData: string;
  initialLayout: LayoutType | LayoutType[];
}) {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const setSettings = useSetSettings();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { runLayouts, isLayoutRunning } = useGraphLayout();
  console.log(isLayoutRunning);
  useEffect(() => {
    fetch(gexfData)
      .then((res) => res.text())
      .then((xml) => {
        const parsed = gexf.parse(Graph, xml);

        // Always assign circular first for base positions
        circular.assign(parsed);

        parsed.forEachNode((node) => {
          const degree = parsed.degree(node);
          parsed.setNodeAttribute(
            node,
            "size",
            Math.min(1 + Math.sqrt(degree), 18)
          );

          const customColor = parsed.getNodeAttribute(node, "1");
          if (customColor) {
            parsed.setNodeAttribute(node, "color", customColor);
          }

          parsed.setNodeAttribute(node, "highlight", false);
        });

        parsed.forEachEdge((edge) => {
          parsed.setEdgeAttribute(edge, "hidden", true);
        });

        sigma.setGraph(parsed);

        // Register interaction events
        registerEvents({
          clickNode: ({ node }) => setSelectedNode(node),
          enterNode: ({ node }) =>
            sigma.getGraph().setNodeAttribute(node, "highlight", true),
          leaveNode: ({ node }) =>
            sigma.getGraph().setNodeAttribute(node, "highlight", false),
          clickStage: () => setSelectedNode(null),
        });

        // After initial circular, apply requested layout with animation
        // runLayouts(initialLayout);
      });
  }, [gexfData, sigma, registerEvents, runLayouts, initialLayout]);

  useEffect(() => {
    setSettings({
      renderLabels: true,
      labelSize: 12,
      labelRenderedSizeThreshold: 8,
      zIndex: true,
      defaultEdgeColor: "rgba(3, 15, 43, 0.1)",
      defaultDrawNodeHover: drawNodeHover,
      defaultDrawNodeLabel: drawNodeLabel,
      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();
        if (!selectedNode) return data;

        if (
          node === selectedNode ||
          graph.neighbors(selectedNode).includes(node)
        ) {
          return { ...data, zIndex: 1 };
        } else {
          return { ...data, color: "#030d2b02", label: null };
        }
      },
      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const source = graph.source(edge);
        const target = graph.target(edge);

        if (!selectedNode) return { ...data, hidden: true };

        return source === selectedNode || target === selectedNode
          ? { ...data, hidden: false }
          : { ...data, hidden: true };
      },
    });
  }, [selectedNode, sigma, setSettings]);

  if (isLayoutRunning) return <LoadingScreen text={`Loading...`} />;
  return null;
}
