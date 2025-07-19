import "./App.css";
import Panel from "./panel";

function App() {
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        border: "2px solid #555", // Added border
        padding: "0",
      }}
    >
      <div
        style={{
          width: "85vw",
          height: "85h",
          maxWidth: "none",
          minWidth: "0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid #000", // Added border
          overflow: "hidden", // Added to ensure panel stays inside
          position: "relative", // Added to contain absolutely positioned elements
        }}
      >
        <Panel />
      </div>
    </div>
  );
}

export default App;
