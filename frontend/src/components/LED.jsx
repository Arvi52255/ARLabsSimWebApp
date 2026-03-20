import { Group, Circle, Text } from "react-konva";

export default function LED({
  data,
  selectedPin,
  onDragEnd,
  onRotate,
  onPinClick
}) {
  const handleDragEnd = (e) => {
    onDragEnd(data.id, e.target.x(), e.target.y());
  };

  const handleDoubleClick = () => {
    const newRotation = (data.rotation + 90) % 360;
    onRotate(data.id, newRotation);
  };

  const glowColor = data.isOn ? "limegreen" : "#555";

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable
      rotation={data.rotation}
      onDragEnd={handleDragEnd}
      onDblClick={handleDoubleClick}
    >
      <Circle radius={18} fill={glowColor} stroke="black" strokeWidth={2} />
      <Text text="LED" x={-12} y={24} fontSize={12} />

      {data.pins?.map((pin) => {
        const isSelected =
          selectedPin &&
          selectedPin.componentId === data.id &&
          selectedPin.pinId === pin.id;

        return (
          <Circle
            key={pin.id}
            x={pin.dx}
            y={pin.dy}
            radius={6}
            fill={isSelected ? "orange" : "red"}
            stroke="black"
            strokeWidth={1}
            onClick={() => onPinClick(data.id, pin.id)}
          />
        );
      })}
    </Group>
  );
}