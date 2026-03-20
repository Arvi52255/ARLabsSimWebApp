import { Group, Rect, Text, Circle } from "react-konva";

export default function Resistor({
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

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable
      rotation={data.rotation}
      onDragEnd={handleDragEnd}
      onDblClick={handleDoubleClick}
    >
      <Rect width={80} height={30} fill="lightgray" stroke="black" />
      <Text text="R" x={18} y={6} fontSize={12} />
      <Text text={`${data.value || 220}Ω`} x={32} y={8} fontSize={10} />

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