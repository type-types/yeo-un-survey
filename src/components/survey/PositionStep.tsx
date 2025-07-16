import { MainPosition } from '@/types';
import { MAIN_POSITIONS } from '@/constants/songs';

interface PositionStepProps {
  selectedPositions: MainPosition[];
  onPositionsChange: (positions: MainPosition[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function PositionStep({ 
  selectedPositions, 
  onPositionsChange, 
  onNext, 
  onPrevious 
}: PositionStepProps) {
  const handlePositionToggle = (position: MainPosition) => {
    if (selectedPositions.includes(position)) {
      onPositionsChange(selectedPositions.filter(p => p !== position));
    } else {
      onPositionsChange([...selectedPositions, position]);
    }
  };

  const canProceed = selectedPositions.length > 0;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            포지션 선택
          </h1>
          <p className="text-gray-600">
            이번 여운 공연에서 어떤 포지션으로 참가 하시나요?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            복수 선택이 가능합니다
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {MAIN_POSITIONS.map((position) => (
            <label
              key={position}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPositions.includes(position)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPositions.includes(position)}
                onChange={() => handlePositionToggle(position)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-lg font-medium text-gray-800">
                {position}
              </span>
            </label>
          ))}
        </div>

        {selectedPositions.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">선택된 포지션</h3>
            <div className="flex flex-wrap gap-2">
              {selectedPositions.map((position) => (
                <span
                  key={position}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {position}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onPrevious}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            이전
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
              canProceed
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
} 