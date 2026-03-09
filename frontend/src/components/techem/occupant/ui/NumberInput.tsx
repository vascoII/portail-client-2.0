// components/ui/NumberInput.tsx
interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="border rounded px-3 py-2 w-full"
      />
    </div>
  );
}
