import { useState } from 'react';
import { Song, SongDetail, MainPosition, DetailedPosition } from '@/types';
import { getDetailedPositions } from '@/constants/songs';

interface SongDetailStepProps {
  song: Song | undefined;
  currentIndex: number;
  totalSongs: number;
  mainPositions: MainPosition[];
  songDetail: SongDetail | undefined;
  onDetailChange: (detail: Partial<SongDetail>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLastSong: boolean;
  submitLoading?: boolean;
}

export default function SongDetailStep({
  song,
  currentIndex,
  totalSongs,
  mainPositions,
  songDetail,
  onDetailChange,
  onNext,
  onPrevious,
  isLastSong,
  submitLoading = false
}: SongDetailStepProps) {
  const [scoreAnimation, setScoreAnimation] = useState(false);

  if (!song) return null;

  const availablePositions = getDetailedPositions(mainPositions);
  const currentScore = songDetail?.completionScore || 0;
  const selectedPositions = songDetail?.selectedPositions || [];
  const selectedPosition = selectedPositions.length > 0 ? selectedPositions[0] : null;
  const opinion = songDetail?.opinion || '';

  const handlePositionSelect = (position: DetailedPosition) => {
    // 라디오 버튼처럼 하나만 선택
    onDetailChange({ selectedPositions: [position] });
  };

  const handleScoreClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const score = Math.round((x / width) * 10);
    
    setScoreAnimation(true);
    setTimeout(() => setScoreAnimation(false), 300);
    
    onDetailChange({ completionScore: score });
  };

  const handleOpinionChange = (value: string) => {
    onDetailChange({ opinion: value });
  };

  // 포지션 선택과 완성도 점수 모두 필수
  const canProceed = selectedPositions.length > 0 && currentScore > 0;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              곡별 상세 정보
            </h1>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {totalSongs}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            {song.title}
          </h2>
        </div>

        <div className="space-y-6">
          {/* 포지션 선택 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              이 곡에서 어떤 포지션으로 참여하시나요? <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-2">
              {availablePositions.map((position) => (
                <label
                  key={position}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPosition === position
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="position"
                    checked={selectedPosition === position}
                    onChange={() => handlePositionSelect(position)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-gray-800">{position}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 완성도 점수 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              이 곡의 완성도가 몇점이라고 생각하시나요? <span className="text-red-500">*</span>
            </h3>
            <div className="mb-4">
              <div
                className="relative w-full h-12 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
                onClick={handleScoreClick}
              >
                <div
                  className={`h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full transition-all duration-300 ${
                    scoreAnimation ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${(currentScore / 10) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 text-sm font-medium text-gray-600">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <span key={num} className="select-none">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center mt-2">
                <span className={`font-bold ${currentScore === 0 ? 'text-base text-red-500' : 'text-2xl text-gray-800'}`}>
                  {currentScore === 0 ? '점수를 선택해주세요' : `${currentScore}/10`}
                </span>
              </div>
            </div>
          </div>

          {/* 의견 작성 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              이 곡에 대한 의견을 자유롭게 적어주세요
            </h3>
            <textarea
              value={opinion}
              onChange={(e) => handleOpinionChange(e.target.value)}
              placeholder="곡에 대한 의견, 개선점, 좋았던 점 등을 적어주세요"
              className="w-full h-24 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={onPrevious}
            disabled={submitLoading}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
              submitLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            이전
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed || submitLoading}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
              canProceed && !submitLoading
                ? `${isLastSong ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitLoading && isLastSong ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                <span>제출 중...</span>
              </div>
            ) : (
              isLastSong ? '설문 완료' : '다음 곡'
            )}
          </button>
        </div>

        {/* 필수 항목 안내 */}
        {!canProceed && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {selectedPositions.length === 0 && currentScore === 0 
                    ? '포지션 선택과 완성도 점수를 입력해주세요.'
                    : selectedPositions.length === 0 
                    ? '포지션을 선택해주세요.'
                    : '완성도 점수를 입력해주세요.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 