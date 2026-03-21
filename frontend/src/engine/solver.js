import { makePinKey } from "./parser";
import { hasPath } from "./validation";

function getResistorsInActivePath(parsed) {
  const { battery, led, resistors, graph } = parsed;

  const batteryPositive = makePinKey(battery.id, "positive");
  const batteryNegative = makePinKey(battery.id, "negative");
  const ledAnode = makePinKey(led.id, "anode");
  const ledCathode = makePinKey(led.id, "cathode");

  return resistors.filter((resistor) => {
    const pinA = makePinKey(resistor.id, "A");
    const pinB = makePinKey(resistor.id, "B");

    const resistorOnPositiveSide =
      hasPath(graph, batteryPositive, pinA) && hasPath(graph, pinB, ledAnode);

    const resistorOnPositiveSideReversed =
      hasPath(graph, batteryPositive, pinB) && hasPath(graph, pinA, ledAnode);

    const resistorOnNegativeSide =
      hasPath(graph, ledCathode, pinA) && hasPath(graph, pinB, batteryNegative);

    const resistorOnNegativeSideReversed =
      hasPath(graph, ledCathode, pinB) && hasPath(graph, pinA, batteryNegative);

    return (
      resistorOnPositiveSide ||
      resistorOnPositiveSideReversed ||
      resistorOnNegativeSide ||
      resistorOnNegativeSideReversed
    );
  });
}

export function solveCircuit(parsed) {
  const { battery, led } = parsed;

  const batteryVoltage = Number(battery?.voltage || 0);
  const ledForwardVoltage = Number(led?.forwardVoltage || 0);

  const activeResistors = getResistorsInActivePath(parsed);

  const invalidResistor = activeResistors.find(
    (resistor) => Number(resistor.value || 0) <= 0
  );

  if (invalidResistor) {
    return {
      valid: false,
      error: `Resistor ${invalidResistor.id} must have a value greater than zero.`
    };
  }

  const totalResistance = activeResistors.reduce(
    (sum, resistor) => sum + Number(resistor.value || 0),
    0
  );

  // No resistor in active path: LED is directly connected to battery
  if (totalResistance === 0) {
    const ledOn = batteryVoltage > ledForwardVoltage;

    return {
      valid: true,
      current: null,
      ledOn,
      brightness: ledOn ? 1 : 0,
      warning: ledOn
        ? "Warning: LED is directly connected to the battery without a resistor and may be damaged."
        : null
    };
  }

  const usableVoltage = batteryVoltage - ledForwardVoltage;
  const current = usableVoltage > 0 ? usableVoltage / totalResistance : 0;

  let brightness = current / 0.02;
  brightness = Math.max(0, Math.min(brightness, 1));

  return {
    valid: true,
    current,
    ledOn: current > 0,
    brightness,
    warning: null
  };
}