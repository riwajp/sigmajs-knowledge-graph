interface TimeSelector {
  range: [number, number];
  onChange: (newRange: [number, number]) => void;
}

export default function TimeRangeSlider({ range, onChange }: TimeSelector) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "200px",
        textAlign: "center",
      }}
    >
      <input
        type="range"
        min="2"
        max="6"
        step="0.1"
        value={range[1]}
        onChange={(e) => onChange([range[0], parseFloat(e.target.value)])}
        style={{ width: "100%" }}
      />
      <p> 02:00 to {Math.trunc(range[1])}:00</p>
    </div>
  );
}
