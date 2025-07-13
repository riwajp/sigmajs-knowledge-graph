// components/GraphLoader.tsx
import { useEffect, useState } from "react";
import Graph from "graphology";
import gexf from "graphology-gexf";
import { useRegisterEvents, useSetSettings, useSigma } from "@react-sigma/core";

import "@react-sigma/core/lib/style.css";

import { drawNodeHover, drawNodeLabel } from "../utils/drawNodeFunctions";

import { circular } from "graphology-layout";

import GraphLayoutControl, { type LayoutType } from "./GraphLayoutControl";
import TimeSelector from "./TimeSelector";

const TWEET_TYPE_COLORS: Record<string, string> = {
  reply: "#ff0000", // red
  quote: "#fff300 ", // yellow
  mention: "#1fff00 ", // green
  retweet: "#ff00c3 ", // pink
};

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
  const [timeRange, setTimeRange] = useState<[number, number]>([2, 6]);
  const [zoomRatio, setZoomRatio] = useState(1);

  const NODE_ATTRS = {
    COMMUNITY: "community",
    COLOR: "color",
  };

  const EDGE_ATTRS = {
    DATE_PUBLISHED: "date_published",
    FROM_USER: "from_user_screen_name",
    TO_USER: "to_user_screen_name",
    TWEET_TYPE: "tweet_type",
    TWEET_URL: "tweet_url",
  };

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
            Math.min(2 + Math.sqrt(degree), 18)
          );

          const customColor = parsed.getNodeAttribute(node, NODE_ATTRS.COLOR);
          if (customColor) {
            parsed.setNodeAttribute(node, "color", customColor);
          }

          parsed.setNodeAttribute(node, "highlight", false);
        });

        parsed.forEachEdge((edge) => {
          parsed.setEdgeAttribute(edge, "hidden", true);
          const source = parsed.source(edge);
          const target = parsed.target(edge);

          const fromUser = parsed.getEdgeAttribute(edge, EDGE_ATTRS.FROM_USER);
          const toUser = parsed.getEdgeAttribute(edge, EDGE_ATTRS.TO_USER);
          const tweetType = parsed.getEdgeAttribute(
            edge,
            EDGE_ATTRS.TWEET_TYPE
          );

          console.log(source, fromUser, toUser, tweetType);

          parsed.setNodeAttribute(source, "label", fromUser);
          parsed.setNodeAttribute(target, "label", toUser);

          const edgeColor = TWEET_TYPE_COLORS[tweetType];
          console.log(edgeColor);
          parsed.setEdgeAttribute(edge, "color", edgeColor);
        });

        sigma.setGraph(parsed);
        setGraphLoaded(true);

        registerEvents({
          clickNode: ({ node }) => {
            setSelectedNode(node);
          },
          enterNode: ({ node }) =>
            sigma.getGraph().setNodeAttribute(node, "highlight", true),
          leaveNode: ({ node }) =>
            sigma.getGraph().setNodeAttribute(node, "highlight", false),

          clickStage: () => setSelectedNode(null),
        });
      });
  }, [gexfData, sigma, registerEvents, setGraphLoaded]);

  useEffect(() => {
    const updateZoom = () => {
      const zoom = sigma.getCamera().getState().ratio;
      setZoomRatio(zoom);
    };
    sigma.getCamera().on("updated", updateZoom), [sigma];
    updateZoom();
  });

  useEffect(() => {
    setSettings({
      renderLabels: true,
      labelSize: 12,
      labelRenderedSizeThreshold: 1,
      zIndex: true,
      defaultEdgeColor: "rgba(3, 15, 43, 0.4)",
      defaultDrawNodeHover: drawNodeHover,
      defaultDrawNodeLabel: drawNodeLabel,
      allowInvalidContainer: true,
      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();

        const size =
          graph.getNodeAttribute(node, "size") / Math.sqrt(zoomRatio);

        if (!selectedNode) {
          const hasVisibleEdge = graph.edges(node).some((edge) => {
            const dateStr = graph.getEdgeAttribute(
              edge,
              EDGE_ATTRS.DATE_PUBLISHED
            );
            const edgeDate = new Date(dateStr);
            const edgeHour = edgeDate.getUTCHours();
            return edgeHour >= timeRange[0] && edgeHour <= timeRange[1];
          });

          return hasVisibleEdge
            ? { ...data, label: size > 8 ? data.label ?? node : null }
            : { ...data, hidden: true };
        }

        if (
          node === selectedNode ||
          graph.neighbors(selectedNode).includes(node)
        ) {
          return { ...data, zIndex: 1, label: data.label ?? node };
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
  }, [selectedNode, timeRange, sigma, setSettings, zoomRatio]);

  return (
    graphLoaded && (
      <>
        <GraphLayoutControl layout={layout} />
        <TimeSelector range={timeRange} onChange={setTimeRange} />
      </>
    )
  );
}
