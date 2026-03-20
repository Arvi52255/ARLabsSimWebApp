import { Group, Rect, Text, Circle, Line } from "react-konva";

export default function Battery({
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
      <Rect width={80} height={40} fill="#e8f0ff" stroke="black" />
      <Text text="Battery" x={12} y={12} fontSize={12} />

      <Text text="+" x={8} y={14} fontSize={14} />
      <Text text="-" x={62} y={14} fontSize={14} />

      <Line points={[22, 8, 22, 32]} stroke="black" strokeWidth={2} />
      <Line points={[32, 12, 32, 28]} stroke="black" strokeWidth={2} />

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