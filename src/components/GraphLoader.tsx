import { useEffect, useState } from "react";
import Graph from "graphology";
import gexf from "graphology-gexf";
import {
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { circular } from "graphology-layout";
import { drawDiscNodeHover, drawDiscNodeLabel } from "sigma/rendering";
import { drawNodeHover, drawNodeLabel } from "../utils/drawNodeFunctions";

export default function GraphLoader() {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  const setSettings = useSetSettings();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    fetch("./data/airlines.gexf")
      .then((res) => res.text())
      .then((xml) => {
        const parsed = gexf.parse(Graph, xml);

        // Assign circular layout by default
        circular.assign(parsed);

        // Set node's sizes based on degree, set highlight flag
        parsed.forEachNode((node) => {
          const degree = parsed.degree(node);
          parsed.setNodeAttribute(
            node,
            "size",
            Math.max(Math.min(Math.log2(degree), 8), 1)
          );
          parsed.setNodeAttribute(node, "highlight", true);
        });

        parsed.forEachEdge((edge) => {
          parsed.setEdgeAttribute(edge, "hidden", true);
        });

        console.log("Graph parsed.");
        loadGraph(parsed);

        // Register click events
        registerEvents({
          clickNode: ({ node }) => {
            setSelectedNode(node);
          },
          clickStage: () => {
            setSelectedNode(null);
          },
        });
      });
  }, [loadGraph, sigma, registerEvents]);

  useEffect(() => {
    setSettings({
      renderLabels: true,
      labelSize: 12,
      labelColor: { color: "#ffffff" },

      zIndex: true,
      defaultEdgeColor: "rgba(3, 15, 43,0.001)",

      defaultDrawNodeHover: (ctx, data, settings) =>
        drawNodeHover(ctx, data, settings),
      defaultDrawNodeLabel: (ctx, data, settings) =>
        drawNodeLabel(ctx, data, settings),

      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();
        if (!selectedNode) return data;
        if (
          node == selectedNode ||
          graph.neighbors(selectedNode).includes(node)
        ) {
          return { ...data, zIndex: 1 };
        } else {
          return { ...data, color: "#030d2b02", label: null }; // fade out unselected
        }
      },
      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const source = graph.source(edge);
        const target = graph.target(edge);

        if (!selectedNode) return { ...data, hidden: true };

        if (source == selectedNode || target == selectedNode)
          return { ...data, hidden: false };
        else return { ...data, hidden: true };
      },
    });
  }, [selectedNode]);

  return null;
}
