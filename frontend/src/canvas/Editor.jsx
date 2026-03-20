import { Stage, Layer, Line } from "react-konva";
import { useState } from "react";
import Resistor from "../components/Resistor";
import Battery from "../components/battery";
import LED from "../components/LED";

export default function Editor() {
  const [components, setComponents] = useState([
    {
      id: 1,
      type: "battery",
      x: 100,
      y: 100,
      rotation: 0,
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
    }
  ]);

  const [wires, setWires] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);

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
  };

  const makePinKey = (componentId, pinId) => `${componentId}:${pinId}`;

  const buildConnectionGraph = () => {
    const graph = {};

    const addEdge = (a, b) => {
      if (!graph[a]) graph[a] = [];
      if (!graph[b]) graph[b] = [];

      if (!graph[a].includes(b)) graph[a].push(b);
      if (!graph[b].includes(a)) graph[b].push(a);
    };

    // External wire connections
    wires.forEach((wire) => {
      const fromKey = makePinKey(wire.from.componentId, wire.from.pinId);
      const toKey = makePinKey(wire.to.componentId, wire.to.pinId);
      addEdge(fromKey, toKey);
    });

    // Internal pass-through connections
    components.forEach((comp) => {
      if (comp.type === "resistor") {
        addEdge(makePinKey(comp.id, "A"), makePinKey(comp.id, "B"));
      }
    });

    return graph;
  };

  const hasPath = (graph, start, target) => {
    if (start === target) return true;

    const visited = new Set();
    const stack = [start];

    while (stack.length > 0) {
      const current = stack.pop();

      if (current === target) return true;
      if (visited.has(current)) continue;

      visited.add(current);

      const neighbors = graph[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    return false;
  };

  const getLedIsOn = () => {
    const battery = components.find((c) => c.type === "battery");
    const led = components.find((c) => c.type === "led");

    if (!battery || !led) return false;

    const graph = buildConnectionGraph();

    const batteryPositive = makePinKey(battery.id, "positive");
    const batteryNegative = makePinKey(battery.id, "negative");
    const ledAnode = makePinKey(led.id, "anode");
    const ledCathode = makePinKey(led.id, "cathode");

    const positivePath = hasPath(graph, batteryPositive, ledAnode);
    const negativePath = hasPath(graph, batteryNegative, ledCathode);

    console.log("Graph:", graph);
    console.log("Positive path:", positivePath);
    console.log("Negative path:", negativePath);

    return positivePath && negativePath;
  };

  // Rotation-aware pin world position
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

  // Helper using componentId and pinId
  const getPinPositionById = (componentId, pinId) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return null;

    const pin = component.pins?.find((p) => p.id === pinId);
    if (!pin) return null;

    return getPinPosition(component, pin);
  };

  const ledIsOn = getLedIsOn();

  const saveCircuit = async () => {
    const circuitData = {
      components,
      wires
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
      data: comp.type === "led" ? { ...comp, isOn: ledIsOn } : comp,
      selectedPin,
      onDragEnd: updateComponentPosition,
      onRotate: updateComponentRotation,
      onPinClick: handlePinClick
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

      {/* Below is displayer for on screen live change confirmer */}
      {/*}  <div
      style={{
        position: "absolute",
        top: 50,
        left: 10,
        zIndex: 10,
        background: "white",
        padding: "8px",
        border: "1px solid black"
      }}
    >
      {JSON.stringify(components)}
    </div>
      */}

      {/* Below is displayer and confirmer for Deploy test version */}
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
        DEPLOY TEST v7. Resistor Update
      </div>

      {/* LED status confirmer */}
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

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedPin(null);
          }
        }}
      >
        <Layer>
          {wires.map((wire) => {
            const from = getPinPositionById(
              wire.from.componentId,
              wire.from.pinId
            );
            const to = getPinPositionById(
              wire.to.componentId,
              wire.to.pinId
            );

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