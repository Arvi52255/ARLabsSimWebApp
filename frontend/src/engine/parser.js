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

  // Internal conductive paths
  components.forEach((comp) => {
    if (comp.type === "resistor") {
      addEdge(makePinKey(comp.id, "A"), makePinKey(comp.id, "B"));
    }

    if (comp.type === "switch" && comp.isClosed) {
      addEdge(makePinKey(comp.id, "A"), makePinKey(comp.id, "B"));
    }
  });

  return graph;
}

export function parseCircuit(components, wires) {
  const battery = components.find((c) => c.type === "battery") || null;
  const led = components.find((c) => c.type === "led") || null;
  const resistors = components.filter((c) => c.type === "resistor");
  const switches = components.filter((c) => c.type === "switch");

  const graph = buildConnectionGraph(components, wires);

  return {
    components,
    wires,
    battery,
    led,
    resistors,
    switches,
    graph
  };
}