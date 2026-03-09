// components/ui/Slider.tsx
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function Slider({ label, value, onChange, min=0, max=20 }: SliderProps) {
  return (
    <div className="mb-4">
      <label className="flex justify-between text-sm mb-2">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}