export const makePinKey = (componentId, pinId) => `${componentId}:${pinId}`;

export function buildConnectionGraph(components, wires) {
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

  // Internal component conduction paths
  components.forEach((comp) => {
    if (comp.type === "resistor") {
      addEdge(makePinKey(comp.id, "A"), makePinKey(comp.id, "B"));
    }

    // Battery is treated as source, not a direct internal conductive path here
    // LED is directional, so we do not directly connect anode-cathode in graph here
    // Later, switch logic can be added here conditionally
  });

  return graph;
}

export function parseCircuit(components, wires) {
  const battery = components.find((c) => c.type === "battery") || null;
  const led = components.find((c) => c.type === "led") || null;
  const resistor = components.find((c) => c.type === "resistor") || null;

  const graph = buildConnectionGraph(components, wires);

  return {
    components,
    wires,
    battery,
    led,
    resistor,
    graph
  };
}