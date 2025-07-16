'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading, signInWithKakao } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/survey');
    }
  }, [user, loading, router]);

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎵</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            여운 공연 설문
          </h1>
          <p className="text-gray-600">
            여운 공연 준비를 위한 설문에 참여해주세요
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">📋 설문 내용</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 참여 포지션 선택</li>
              <li>• 참여 곡 선택</li>
              <li>• 곡별 만족도 평가</li>
              <li>• 곡별 의견 작성</li>
            </ul>
          </div>

          <button
            onClick={handleKakaoLogin}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md"
          >
            <span>💬</span>
            <span>카카오톡으로 시작하기</span>
          </button>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🛡️ 개인정보 보호</h3>
            <p className="text-sm text-blue-700">
              로그인 정보는 설문 참여 확인 목적으로만 사용되며, 
              별도로 저장되지 않습니다.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h3>
            <p className="text-sm text-yellow-700">
              카카오 로그인 기능이 완전히 구현되지 않았습니다. 
              개발자에게 문의하세요.
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center">
            카카오톡 로그인 후 설문에 참여하실 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
