import { SONGS } from '@/constants/songs';

interface SongSelectionStepProps {
  selectedSongs: number[];
  onSongsChange: (songIds: number[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function SongSelectionStep({ 
  selectedSongs, 
  onSongsChange, 
  onNext, 
  onPrevious 
}: SongSelectionStepProps) {
  const handleSongToggle = (songId: number) => {
    if (selectedSongs.includes(songId)) {
      onSongsChange(selectedSongs.filter(id => id !== songId));
    } else {
      onSongsChange([...selectedSongs, songId]);
    }
  };

  const canProceed = selectedSongs.length > 0;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            참여 곡 선택
          </h1>
          <p className="text-gray-600">
            이번 여운 공연에서 어떤 곡에 참여하시나요?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            다중 선택이 가능합니다
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto mb-6">
          <div className="space-y-2">
            {SONGS.map((song) => (
              <label
                key={song.id}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSongs.includes(song.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSongs.includes(song.id)}
                  onChange={() => handleSongToggle(song.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-800">
                  <span className="font-medium">{song.id}.</span> {song.title}
                </span>
              </label>
            ))}
          </div>
        </div>

        {selectedSongs.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">
              선택된 곡 ({selectedSongs.length}개)
            </h3>
            <div className="text-sm text-green-700 space-y-1">
              {selectedSongs
                .sort((a, b) => a - b)
                .map((songId) => {
                  const song = SONGS.find(s => s.id === songId);
                  return (
                    <div key={songId}>
                      {song?.id}. {song?.title}
                    </div>
                  );
                })}
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