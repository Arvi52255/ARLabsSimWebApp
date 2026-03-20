import { Group, Rect, Text, Circle, Line } from "react-konva";

export default function Battery({
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
      onDblTap={handleDoubleClick}
      onMouseDown={handleSelect}
      onTap={handleSelect}
    >
      <Rect
        width={80}
        height={40}
        fill="#e8f0ff"
        stroke="black"
        onMouseDown={handleSelect}
        onTap={handleSelect}
      />
      <Text
        text="Battery"
        x={12}
        y={12}
        fontSize={12}
        onMouseDown={handleSelect}
        onTap={handleSelect}
      />
      <Text
        text={`${data.voltage ?? 9}V`}
        x={18}
        y={26}
        fontSize={10}
        onMouseDown={handleSelect}
        onTap={handleSelect}
      />

      <Text text="+" x={8} y={14} fontSize={14} fill="red" listening={false} />
      <Text text="-" x={62} y={14} fontSize={14} fill="black" listening={false} />

      <Line points={[22, 8, 22, 32]} stroke="black" strokeWidth={2} listening={false} />
      <Line points={[32, 12, 32, 28]} stroke="black" strokeWidth={2} listening={false} />

      {data.pins?.map((pin) => {
        const isSelected =
          selectedPin &&
          selectedPin.componentId === data.id &&
          selectedPin.pinId === pin.id;

        const defaultPinColor =
          pin.id === "positive"
            ? "red"
            : pin.id === "negative"
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
            onTap={(e) => {
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