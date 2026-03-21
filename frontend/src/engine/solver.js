import { makePinKey } from "./parser";
import { hasPath } from "./validation";

export function solveCircuit(parsed) {
  const { battery, led, resistor, graph } = parsed;

  const batteryPositive = makePinKey(battery.id, "positive");
  const batteryNegative = makePinKey(battery.id, "negative");

  const resistorA = makePinKey(resistor.id, "A");
  const resistorB = makePinKey(resistor.id, "B");

  //  Check if resistor is actually part of the circuit loop
  const resistorInPath =
    hasPath(graph, batteryPositive, resistorA) &&
    hasPath(graph, resistorB, batteryNegative);

  let effectiveResistance = 0;

  if (resistorInPath) {
    effectiveResistance = Number(resistor.value || 0);
  }

  const batteryVoltage = Number(battery.voltage || 0);
  const ledForwardVoltage = Number(led.forwardVoltage || 0);

  // If no resistor in path → treat as very low resistance (or direct)
  if (effectiveResistance <= 0) {
    const current = batteryVoltage > ledForwardVoltage ? 0.02 : 0;

    return {
      valid: true,
      current,
      ledOn: current > 0,
      brightness: current > 0 ? 1 : 0
    };
  }

  const usableVoltage = batteryVoltage - ledForwardVoltage;
  const current =
    usableVoltage > 0 ? usableVoltage / effectiveResistance : 0;

  let brightness = current / 0.02;
  brightness = Math.max(0, Math.min(brightness, 1));

  return {
    valid: true,
    current,
    ledOn: current > 0,
    brightness
  };
}