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
          width: "80vw",
          height: "80vh",
          maxWidth: "none",
          minWidth: "0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid #000", // Added border
        }}
      >
        <Panel />
      </div>
    </div>
  );
}

export default App;
