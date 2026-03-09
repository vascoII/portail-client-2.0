// components/ui/Toggle.tsx
interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`block w-6 h-6 bg-white rounded-full transform transition ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}