// components/wizard/StepNavigation.tsx
interface StepNavigationProps {
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepNavigation({ current, total, onNext, onPrev }: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={onPrev}
        disabled={current === 0}
        className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-100"
      >
        Retour
      </button>

      <button
        onClick={onNext}
        disabled={current === total - 1}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:bg-blue-300"
      >
        Suivant
      </button>
    </div>
  );
}
