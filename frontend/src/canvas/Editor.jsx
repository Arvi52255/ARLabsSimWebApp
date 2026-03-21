import { Stage, Layer, Line } from "react-konva";
import { useState } from "react";
import Resistor from "../components/Resistor";
import Battery from "../components/Battery";
import LED from "../components/LED";
import Switch from "../components/Switch";
import { parseCircuit } from "../engine/parser";
import { validateCircuit } from "../engine/validation";
import { solveCircuit } from "../engine/solver";

export default function Editor() {
  const [components, setComponents] = useState([
    {
      id: 1,
      type: "battery",
      x: 100,
      y: 100,
      rotation: 0,
      voltage: 9,
      pins: [
        { id: "positive", dx: -10, dy: 20 },
        { id: "negative", dx: 90, dy: 20 }
      ]
    },
    {
      id: 2,
      type: "led",
      x: 300,
      y: 120,
      rotation: 0,
      forwardVoltage: 2,
      isOn: false,
      brightness: 0,
      pins: [
        { id: "anode", dx: -25, dy: 0 },
        { id: "cathode", dx: 25, dy: 0 }
      ]
    },
    {
      id: 3,
      type: "resistor",
      x: 500,
      y: 200,
      rotation: 0,
      value: 220,
      pins: [
        { id: "A", dx: -10, dy: 15 },
        { id: "B", dx: 90, dy: 15 }
      ]
    },
    {
      id: 4,
      type: "switch",
      x: 300,
      y: 260,
      rotation: 0,
      isClosed: true,
      pins: [
        { id: "A", dx: 0, dy: 15 },
        { id: "B", dx: 80, dy: 15 }
      ]
    }
  ]);

  const [wires, setWires] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const updateComponentPosition = (id, newX, newY) => {
    console.log("Updating position:", id, newX, newY);

    setComponents((prevComponents) =>
      prevComponents.map((comp) =>
        comp.id === id ? { ...comp, x: newX, y: newY } : comp
      )
    );
  };

  const updateComponentRotation = (id, newRotation) => {
    console.log("Updating rotation:", id, newRotation);

    setComponents((prevComponents) =>
      prevComponents.map((comp) =>
        comp.id === id ? { ...comp, rotation: newRotation } : comp
      )
    );
  };

  const updateComponentField = (id, field, newValue) => {
    console.log("Updating field:", id, field, newValue);

    setComponents((prevComponents) =>
      prevComponents.map((comp) =>
        comp.id === id ? { ...comp, [field]: newValue } : comp
      )
    );
  };

  const handlePinClick = (componentId, pinId) => {
    console.log("Pin clicked:", componentId, pinId);

    if (!selectedPin) {
      setSelectedPin({ componentId, pinId });
      return;
    }

    if (
      selectedPin.componentId === componentId &&
      selectedPin.pinId === pinId
    ) {
      setSelectedPin(null);
      return;
    }

    const duplicateWire = wires.some(
      (wire) =>
        (wire.from.componentId === selectedPin.componentId &&
          wire.from.pinId === selectedPin.pinId &&
          wire.to.componentId === componentId &&
          wire.to.pinId === pinId) ||
        (wire.from.componentId === componentId &&
          wire.from.pinId === pinId &&
          wire.to.componentId === selectedPin.componentId &&
          wire.to.pinId === selectedPin.pinId)
    );

    if (duplicateWire) {
      alert("These pins are already connected.");
      setSelectedPin(null);
      return;
    }

    const newWire = {
      id: Date.now(),
      from: selectedPin,
      to: { componentId, pinId }
    };

    console.log("Creating wire:", newWire);

    setWires((prevWires) => [...prevWires, newWire]);
    setSelectedPin(null);
  };

  const removeWire = (wireId) => {
    console.log("Removing wire:", wireId);
    setWires((prevWires) => prevWires.filter((wire) => wire.id !== wireId));
    setSelectedPin(null);
  };

  const clearWires = () => {
    console.log("Clearing all wires");
    setWires([]);
    setSelectedPin(null);
    setSimulationResult(null);
  };

  const runSimulation = () => {
    const parsed = parseCircuit(components, wires);
    console.log("Parsed circuit:", parsed);

    const validation = validateCircuit(parsed);
    console.log("Validation result:", validation);

    if (!validation.valid) {
      setSimulationResult(validation);
      return;
    }

    const result = solveCircuit(parsed);
    console.log("Solver result:", result);
    setSimulationResult(result);
  };

  const getPinPosition = (component, pin) => {
    if (!component || !pin) return null;

    const angle = (component.rotation * Math.PI) / 180;

    const rotatedX = pin.dx * Math.cos(angle) - pin.dy * Math.sin(angle);
    const rotatedY = pin.dx * Math.sin(angle) + pin.dy * Math.cos(angle);

    return {
      x: component.x + rotatedX,
      y: component.y + rotatedY
    };
  };

  const getPinPositionById = (componentId, pinId) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return null;

    const pin = component.pins?.find((p) => p.id === pinId);
    if (!pin) return null;

    return getPinPosition(component, pin);
  };

  const selectedComponent = components.find(
    (comp) => comp.id === selectedComponentId
  );

  const ledIsOn = simulationResult?.valid ? simulationResult.ledOn : false;
  const ledBrightness = simulationResult?.valid
    ? simulationResult.brightness
    : 0;

  const saveCircuit = async () => {
    const circuitData = {
      components,
      wires,
      simulationResult
    };

    console.log("Sending to backend:", circuitData);

    try {
      const response = await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(circuitData)
      });

      const data = await response.json();
      console.log("Saved:", data);
      alert("Circuit saved!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving circuit");
    }
  };

  const renderComponent = (comp) => {
    const commonProps = {
      key: comp.id,
      data:
        comp.type === "led"
          ? { ...comp, isOn: ledIsOn, brightness: ledBrightness }
          : comp,
      selectedPin,
      onDragEnd: updateComponentPosition,
      onRotate: updateComponentRotation,
      onPinClick: handlePinClick,
      onSelect: setSelectedComponentId
    };

    if (comp.type === "battery") {
      return <Battery {...commonProps} />;
    }

    if (comp.type === "led") {
      return <LED {...commonProps} />;
    }

    if (comp.type === "resistor") {
      return <Resistor {...commonProps} />;
    }

    if (comp.type === "switch") {
      return <Switch {...commonProps} />;
    }

    return null;
  };

  return (
    <>
      <button
        onClick={saveCircuit}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10
        }}
      >
        Save Circuit
      </button>

      <button
        onClick={clearWires}
        style={{
          position: "absolute",
          top: 45,
          left: 10,
          zIndex: 10
        }}
      >
        Clear Wires
      </button>

      <button
        onClick={runSimulation}
        style={{
          position: "absolute",
          top: 45,
          left: 120,
          zIndex: 10
        }}
      >
        Simulate
      </button>

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 10,
          zIndex: 10,
          background: "yellow",
          padding: "6px"
        }}
      >
        DEPLOY TEST v12. Switch Added
      </div>

      <div
        style={{
          position: "absolute",
          top: 120,
          left: 10,
          zIndex: 10,
          background: "lightgreen",
          padding: "6px",
          border: "1px solid black"
        }}
      >
        LED Status: {ledIsOn ? "ON" : "OFF"}
      </div>

      <div
        style={{
          position: "absolute",
          top: 160,
          left: 10,
          zIndex: 10,
          background: "#f0f0f0",
          padding: "6px",
          border: "1px solid black"
        }}
      >
        Wires: {wires.length} | Click a wire to delete it
      </div>

      <div
        style={{
          position: "absolute",
          top: 200,
          left: 10,
          zIndex: 10,
          background: "#e8f4ff",
          padding: "8px",
          border: "1px solid black",
          minWidth: "260px"
        }}
      >
        <div>
          <strong>Simulation Result</strong>
        </div>

        {!simulationResult && <div>Not simulated yet</div>}

        {simulationResult?.error && <div>Error: {simulationResult.error}</div>}

        {simulationResult?.warning && (
          <div style={{ color: "darkorange", marginTop: "6px" }}>
            {simulationResult.warning}
          </div>
        )}

        {simulationResult?.valid && (
          <>
            <div>
              Current:{" "}
              {simulationResult.current === null
                ? "Very high / unprotected"
                : `${simulationResult.current.toFixed(4)} A`}
            </div>
            <div>LED: {simulationResult.ledOn ? "ON" : "OFF"}</div>
            <div>
              Brightness: {(simulationResult.brightness * 100).toFixed(0)}%
            </div>
          </>
        )}
      </div>

      {selectedComponent && (
        <div
          style={{
            position: "absolute",
            top: 320,
            left: 10,
            zIndex: 10,
            background: "white",
            padding: "10px",
            border: "1px solid black",
            minWidth: "240px"
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>Selected:</strong> {selectedComponent.type}
          </div>

          {selectedComponent.type === "battery" && (
            <div>
              <label>Voltage: </label>
              <input
                type="number"
                value={selectedComponent.voltage || 0}
                onChange={(e) =>
                  updateComponentField(
                    selectedComponent.id,
                    "voltage",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {selectedComponent.type === "resistor" && (
            <div>
              <label>Resistance (Ω): </label>
              <input
                type="number"
                value={selectedComponent.value || 0}
                onChange={(e) =>
                  updateComponentField(
                    selectedComponent.id,
                    "value",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {selectedComponent.type === "led" && (
            <div>
              <label>Forward Voltage: </label>
              <input
                type="number"
                step="0.1"
                value={selectedComponent.forwardVoltage || 0}
                onChange={(e) =>
                  updateComponentField(
                    selectedComponent.id,
                    "forwardVoltage",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {selectedComponent.type === "switch" && (
            <div>
              <label>State: </label>
              <button
                onClick={() =>
                  updateComponentField(
                    selectedComponent.id,
                    "isClosed",
                    !selectedComponent.isClosed
                  )
                }
                style={{ marginLeft: "8px" }}
              >
                {selectedComponent.isClosed ? "Closed" : "Open"}
              </button>
            </div>
          )}
        </div>
      )}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedPin(null);
            setSelectedComponentId(null);
          }
        }}
        onTap={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedPin(null);
            setSelectedComponentId(null);
          }
        }}
      >
        <Layer>
          {wires.map((wire) => {
            const from = getPinPositionById(
              wire.from.componentId,
              wire.from.pinId
            );
            const to = getPinPositionById(wire.to.componentId, wire.to.pinId);

            if (!from || !to) return null;

            return (
              <Line
                key={wire.id}
                points={[from.x, from.y, to.x, to.y]}
                stroke="black"
                strokeWidth={2}
                hitStrokeWidth={12}
                onClick={(e) => {
                  e.cancelBubble = true;
                  removeWire(wire.id);
                }}
              />
            );
          })}

          {components.map((comp) => renderComponent(comp))}
        </Layer>
      </Stage>
    </>
  );
}