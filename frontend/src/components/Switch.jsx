import { Group, Line, Circle, Text } from "react-konva";

export default function Switch({
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

  const handleDoubleClick = (e) => {
    e.cancelBubble = true;
    const newRotation = (data.rotation + 90) % 360;
    onRotate(data.id, newRotation);
  };

  const handleSelect = (e) => {
    e.cancelBubble = true;
    onSelect(data.id);
  };

  return (
    <Group
      x={data.x}
      y={data.y}
      draggable
      rotation={data.rotation}
      onDragEnd={handleDragEnd}
      onDblClick={handleDoubleClick}
      onClick={handleSelect}
      onTap={handleSelect}
    >
      {/* Left terminal */}
      <Circle x={0} y={15} radius={4} fill="black" />

      {/* Right terminal */}
      <Circle x={80} y={15} radius={4} fill="black" />

      {/* Base line left */}
      <Line points={[0, 15, 20, 15]} stroke="black" strokeWidth={2} />

      {/* Base line right */}
      <Line points={[60, 15, 80, 15]} stroke="black" strokeWidth={2} />

      {/* Switch arm */}
      {data.isClosed ? (
        <Line points={[20, 15, 60, 15]} stroke="black" strokeWidth={3} />
      ) : (
        <Line points={[20, 15, 55, 0]} stroke="black" strokeWidth={3} />
      )}

      <Text
        text={data.isClosed ? "SW CLOSED" : "SW OPEN"}
        x={5}
        y={28}
        fontSize={12}
        fill={data.isClosed ? "green" : "red"}
      />

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
            radius={8}
            fill={isSelected ? "orange" : "white"}
            stroke="black"
            strokeWidth={2}
            onClick={(e) => {
              e.cancelBubble = true;
              onPinClick(data.id, pin.id);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onPinClick(data.id, pin.id);
            }}
          />
        );
      })}
    </Group>
  );
}