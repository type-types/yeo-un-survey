import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CompleteStepProps {
  user: User;
}

export default function CompleteStep({ user }: CompleteStepProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // 자동 홈 이동 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            설문 완료!
          </h1>
          <p className="text-gray-600">
            {user.name}님의 설문이 성공적으로 제출되었습니다.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">📊 제출된 내용</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• 참여 포지션 정보</div>
            <div>• 참여 곡 목록</div>
            <div>• 곡별 완성도 평가</div>
            <div>• 곡별 의견 및 피드백</div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">🎵 다음 단계</h3>
          <p className="text-sm text-green-700">
            제출해주신 정보를 바탕으로 여운 공연을 더욱 완성도 높게 준비하겠습니다.
            참여해주셔서 감사합니다!
          </p>
        </div>

        {/* 자동 이동 알림 */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⏰ 자동 이동</h3>
          <p className="text-sm text-yellow-700">
            {countdown}초 후 홈페이지로 자동 이동합니다
          </p>
          <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            바로 홈으로 가기
          </button>
          
          <p className="text-xs text-gray-500">
            설문에 참여해주셔서 감사합니다!
          </p>
        </div>
      </div>
    </div>
  );
} 