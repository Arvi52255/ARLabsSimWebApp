import { makePinKey } from "./parser";

export function hasPath(graph, start, target) {
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
}

export function validateCircuit(parsed) {
  const { battery, led, resistor, graph } = parsed;

  if (!battery || !led || !resistor) {
    return {
      valid: false,
      error: "Battery, LED, or resistor is missing."
    };
  }

  const batteryPositive = makePinKey(battery.id, "positive");
  const batteryNegative = makePinKey(battery.id, "negative");
  const ledAnode = makePinKey(led.id, "anode");
  const ledCathode = makePinKey(led.id, "cathode");

  const positivePath = hasPath(graph, batteryPositive, ledAnode);
  const negativePath = hasPath(graph, batteryNegative, ledCathode);

  if (!positivePath || !negativePath) {
    return {
      valid: false,
      error: "Open circuit or incorrect LED connection."
    };
  }

  if ((resistor.value || 0) <= 0) {
    return {
      valid: false,
      error: "Resistance must be greater than zero."
    };
  }

  return {
    valid: true,
    error: null
  };
}