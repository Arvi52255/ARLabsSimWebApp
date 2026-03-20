import { Group, Circle, Text } from "react-konva";

export default function LED({
  data,
  selectedPin,
  onDragEnd,
  onRotate,
  onPinClick,
  onSelect
}) {
  const handleDragEnd = (e) => {
    onDragEnd(data.id, e.target.x(), e.target.y());
  };

  const handleDoubleClick = () => {
    const newRotation = (data.rotation + 90) % 360;
    onRotate(data.id, newRotation);
  };

  const brightness = Math.max(0, Math.min(data.brightness || 0, 1));
  const isOn = data.isOn;

  const glowFill = isOn ? "limegreen" : "#444";
  const glowBlur = isOn ? 10 + brightness * 35 : 0;
  const glowOpacity = isOn ? 0.25 + brightness * 0.75 : 0;
  const outerRadius = 24 + brightness * 8;

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable
      rotation={data.rotation}
      onDragEnd={handleDragEnd}
      onDblClick={handleDoubleClick}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(data.id);
      }}
    >
      {/* Outer glow */}
      {isOn && (
        <Circle
          radius={outerRadius}
          fill="limegreen"
          opacity={0.12 + brightness * 0.28}
          listening={false}
        />
      )}

      {/* Main LED body */}
      <Circle
        radius={18}
        fill={glowFill}
        stroke="black"
        strokeWidth={2}
        shadowColor="limegreen"
        shadowBlur={glowBlur}
        shadowOpacity={glowOpacity}
      />

      {/* Inner highlight */}
      <Circle
        radius={10}
        fill={isOn ? "palegreen" : "#666"}
        opacity={isOn ? 0.35 + brightness * 0.4 : 0.3}
        listening={false}
      />

      <Text text="LED" x={-12} y={24} fontSize={12} />

      <Text text="+" x={-28} y={-5} fontSize={12} fill="red" />
      <Text text="-" x={18} y={-5} fontSize={12} fill="black" />

      {data.pins?.map((pin) => {
        const isSelected =
          selectedPin &&
          selectedPin.componentId === data.id &&
          selectedPin.pinId === pin.id;

        const defaultPinColor =
          pin.id === "anode"
            ? "red"
            : pin.id === "cathode"
            ? "black"
            : "red";

        return (
          <Circle
            key={pin.id}
            x={pin.dx}
            y={pin.dy}
            radius={6}
            fill={isSelected ? "orange" : defaultPinColor}
            stroke="black"
            strokeWidth={1}
            onMouseDown={(e) => {
              e.cancelBubble = true;
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              onPinClick(data.id, pin.id);
            }}
          />
        );
      })}
    </Group>
  );
}