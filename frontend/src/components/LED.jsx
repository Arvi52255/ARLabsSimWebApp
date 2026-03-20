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

  const glowColor = data.isOn ? "limegreen" : "#444";

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable
      rotation={data.rotation}
      onDragEnd={handleDragEnd}
      onDblClick={handleDoubleClick}
    >
      <Circle
        radius={18}
        fill={glowColor}
        stroke="black"
        strokeWidth={2}
        shadowColor={data.isOn ? "limegreen" : undefined}
        shadowBlur={data.isOn ? 25 : 0}
        shadowOpacity={data.isOn ? 0.9 : 0}
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