import { useEffect } from "react";
import "./App.css";
import Graph from "graphology";
import gexf from "graphology-gexf";
import { SigmaContainer, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { circular } from "graphology-layout";
import LayoutToggle from "./components/LayoutToggle";

function LoadGraph() {
  const sigma = useSigma();

  useEffect(() => {
    fetch("./data/airlines.gexf")
      .then((res) => res.text())
      .then((xml) => {
        const parsed = gexf.parse(Graph, xml);

        circular.assign(parsed);

        console.log("Graph parsed.");

        sigma.setGraph(parsed);
      });
  }, []);

  return null;
}

export default function App() {
  return (
    <SigmaContainer
      style={{ height: "600px", width: "600px", position: "relative" }}
    >
      <LayoutToggle />
      <LoadGraph />
    </SigmaContainer>
  );
}
