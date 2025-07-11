import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import GraphLoader from "./components/GraphLoader";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SigmaContainer
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          backgroundColor: "#030f2b",
        }}
      >
        <GraphLoader gexfData="./data/airlines.gexf" layout={"forceAtlas2"} />
      </SigmaContainer>
    </div>
  );
}
