export default function Toolbox({ onAddComponent }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 20,
        background: "white",
        padding: "12px",
        border: "1px solid black",
        minWidth: "180px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <strong>Toolbox</strong>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button onClick={() => onAddComponent("battery")}>Add Battery</button>
        <button onClick={() => onAddComponent("resistor")}>Add Resistor</button>
        <button onClick={() => onAddComponent("led")}>Add LED</button>
        <button onClick={() => onAddComponent("switch")}>Add Switch</button>
      </div>
    </div>
  );
}