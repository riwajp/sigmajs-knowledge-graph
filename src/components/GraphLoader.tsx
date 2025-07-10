import { useEffect, useState } from "react";
import Graph from "graphology";
import gexf from "graphology-gexf";
import { useRegisterEvents, useSetSettings, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { circular } from "graphology-layout";
import { drawNodeHover, drawNodeLabel } from "../utils/drawNodeFunctions";

export default function GraphLoader() {
  const sigma = useSigma();

  const registerEvents = useRegisterEvents();

  const setSettings = useSetSettings(); // for dynamically setting the graph's settings

  const [selectedNode, setSelectedNode] = useState<string | null>(null); // node clicked by the user

  // fetch and initialize graph
  useEffect(() => {
    fetch("./data/flood_communities.gexf")
      .then((res) => res.text())
      .then((xml) => {
        const parsed = gexf.parse(Graph, xml);

        // Assign circular layout by default
        circular.assign(parsed);

        // Set node's sizes based on degree, set highlight flag to false by default
        parsed.forEachNode((node) => {
          const degree = parsed.degree(node);
          parsed.setNodeAttribute(
            node,
            "size",
            Math.min(1 + Math.sqrt(degree), 18)
          );
          const color = parsed.getNodeAttribute(node, "1");
          if (color) {
            parsed.setNodeAttribute(node, "color", color);
          }
          parsed.setNodeAttribute(node, "highlight", false);
        });

        // hide all edge initially
        parsed.forEachEdge((edge) => {
          parsed.setEdgeAttribute(edge, "hidden", true);
        });

        sigma.setGraph(parsed);

        // Register click and hover events
        registerEvents({
          clickNode: ({ node }) => {
            setSelectedNode(node);
          },
          enterNode: ({ node }) => {
            sigma.getGraph().setNodeAttribute(node, "highlight", true);
          },
          leaveNode: ({ node }) => {
            sigma.getGraph().setNodeAttribute(node, "highlight", false);
          },

          clickStage: () => {
            setSelectedNode(null);
          },
        });
      });
  }, [sigma, registerEvents]);

  // set settings
  useEffect(() => {
    setSettings({
      renderLabels: true,
      labelSize: 12,
      labelRenderedSizeThreshold: 8,

      zIndex: true,
      defaultEdgeColor: "rgba(3, 15, 43,0.001)",

      defaultDrawNodeHover: (ctx, data, settings) =>
        drawNodeHover(ctx, data, settings),
      defaultDrawNodeLabel: (ctx, data, settings) =>
        drawNodeLabel(ctx, data, settings),

      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();

        // set custom properties for selected node and its neighbors
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

        // show an edge only if it is connected to selected node
        if (!selectedNode) return { ...data, hidden: true };

        if (source == selectedNode || target == selectedNode)
          return { ...data, hidden: false };
        else return { ...data, hidden: true };
      },
    });
  }, [selectedNode]);

  return null;
}
