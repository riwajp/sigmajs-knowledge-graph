// components/GraphLoader.tsx
import { useEffect, useState } from "react";
import Graph from "graphology";
import gexf from "graphology-gexf";
import { useRegisterEvents, useSetSettings, useSigma } from "@react-sigma/core";

import "@react-sigma/core/lib/style.css";

import { drawNodeHover, drawNodeLabel } from "../utils/drawNodeFunctions";

import { circular } from "graphology-layout";

import GraphLayoutControl, { type LayoutType } from "./GraphLayoutControl";

export default function GraphLoader({
  gexfData,
  layout,
}: {
  gexfData: string;
  layout: LayoutType;
}) {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const setSettings = useSetSettings();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [graphLoaded, setGraphLoaded] = useState(false);

  useEffect(() => {
    fetch(gexfData)
      .then((res) => res.text())
      .then((xml) => {
        const parsed = gexf.parse(Graph, xml);

        circular.assign(parsed);

        console.log("Circle assigned");
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
        setGraphLoaded(true);

        registerEvents({
          clickNode: ({ node }) => setSelectedNode(node),
          enterNode: ({ node }) =>
            sigma.getGraph().setNodeAttribute(node, "highlight", true),
          leaveNode: ({ node }) =>
            sigma.getGraph().setNodeAttribute(node, "highlight", false),
          clickStage: () => setSelectedNode(null),
        });
      });
  }, [gexfData, sigma, registerEvents, setGraphLoaded]);

  useEffect(() => {
    setSettings({
      renderLabels: true,
      labelSize: 12,
      labelRenderedSizeThreshold: 8,
      zIndex: true,
      defaultEdgeColor: "rgba(3, 15, 43, 0.1)",
      defaultDrawNodeHover: drawNodeHover,
      defaultDrawNodeLabel: drawNodeLabel,
      allowInvalidContainer: true,
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

  return graphLoaded && <GraphLayoutControl layout={layout} />;
}
