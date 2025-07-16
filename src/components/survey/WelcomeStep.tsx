import { User } from '@/types';

interface WelcomeStepProps {
  user: User;
  onNext: () => void;
}

export default function WelcomeStep({ user, onNext }: WelcomeStepProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          {user.profileImage && (
            <img 
              src={user.profileImage} 
              alt={user.name}
              className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-blue-200"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {user.name}님, 반갑습니다!
          </h1>
          <p className="text-gray-600">
            진행 현황을 파악하고자 몇가지 질문 드릴게요
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 설문 진행 순서</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>1. 포지션 선택</div>
              <div>2. 참여 곡 선택</div>
              <div>3. 곡별 상세 정보 입력</div>
              <div>4. 설문 완료</div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⏰ 예상 소요 시간</h3>
            <p className="text-sm text-yellow-700">약 5-10분</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          설문 시작하기
        </button>
      </div>
    </div>
  );
} 