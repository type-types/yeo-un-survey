'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSurvey } from '@/hooks/useSurvey';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MobileCalendar from '@/components/MobileCalendar';

export default function HomePage() {
  const { user, loading, signInWithKakao, signOut, isKakaoLoaded } = useAuth();
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'survey' | 'calendar'>('survey');
  
  // 설문 완료 여부 체크를 위해 useSurvey 훅 사용
  const { checkSurveyCompleted } = useSurvey(user?.id || '');

  useEffect(() => {
    // 로그인된 사용자가 있고 로딩이 완료된 경우
    if (user && !loading) {
      const checkAndRedirect = async () => {
        try {
          const isSurveyCompleted = await checkSurveyCompleted(user.id);
          
          // 설문을 완료하지 않은 사용자만 설문 페이지로 이동
          if (!isSurveyCompleted) {
            console.log('🔄 설문 미완료 사용자, 설문 페이지로 이동');
            router.push('/survey');
          } else {
            console.log('✅ 설문 완료 사용자, 홈페이지에서 유지');
          }
        } catch (error) {
          console.error('❌ 설문 완료 여부 확인 오류:', error);
        }
      };
      
      checkAndRedirect();
    }
  }, [user, loading, router, checkSurveyCompleted]);

  const handleKakaoLogin = async () => {
    if (!isKakaoLoaded) {
      alert('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithKakao();
      // 성공 시 useEffect에서 자동으로 설문 완료 여부에 따라 처리
    } catch (error: any) {
      console.error('카카오 로그인 실패:', error);
      
      // 사용자 친화적인 오류 메시지
      let errorMessage = '카카오 로그인에 실패했습니다.';
      if (error.message.includes('SDK가 아직 로드되지 않았습니다')) {
        errorMessage = '카카오 로그인 준비 중입니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('사용자가 취소')) {
        errorMessage = '로그인이 취소되었습니다.';
      } else if (error.message.includes('Custom Token 생성 실패')) {
        errorMessage = '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = confirm('정말 로그아웃하시겠습니까?');
    if (!confirmLogout) return;

    setLogoutLoading(true);
    try {
      await signOut();
      console.log('✅ 로그아웃 완료');
      // 홈페이지에 그대로 있으면서 로그인 화면을 다시 보여줌
    } catch (error: any) {
      console.error('❌ 로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLogoutLoading(false);
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

  // 설문 완료 여부 상태 추가
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  
  // 설문 완료 여부 확인
  useEffect(() => {
    if (user) {
      const checkCompleted = async () => {
        try {
          const completed = await checkSurveyCompleted(user.id);
          setIsSurveyCompleted(completed);
        } catch (error) {
          console.error('❌ 설문 완료 여부 확인 오류:', error);
          setIsSurveyCompleted(false);
        }
      };
      
      checkCompleted();
    } else {
      setIsSurveyCompleted(false);
    }
  }, [user, checkSurveyCompleted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎵</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            여운 공연
          </h1>
          <p className="text-gray-600">
            {user && isSurveyCompleted ? `${user.name}님, 설문 참여 감사합니다!` : '공연 준비와 일정을 확인하세요'}
          </p>
        </div>

        {/* 로그인된 사용자이고 설문 완료한 경우 */}
        {user && isSurveyCompleted ? (
          <>
            {/* 설문 완료 알림 */}
            <div className="bg-green-50 rounded-2xl shadow-lg p-6 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">✅</span>
                </div>
                <h2 className="text-lg font-bold text-green-800 mb-2">
                  설문 완료됨
                </h2>
                <p className="text-sm text-green-700">
                  설문에 참여해주셔서 감사합니다!
                </p>
              </div>
            </div>

            {/* 달력만 표시 */}
            <MobileCalendar />

            {/* 로그아웃 버튼 */}
            <div className="mt-6">
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  logoutLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300'
                }`}
              >
                {logoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    <span>로그아웃 중...</span>
                  </>
                ) : (
                  <>
                    <span>🚪</span>
                    <span>로그아웃</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : user ? (
          <>
            {/* 로그인했지만 설문 미완료인 경우 */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  안녕하세요, {user.name}님! 👋
                </h2>
                <p className="text-gray-600">
                  설문에 참여해주세요
                </p>
              </div>

              <button
                onClick={() => router.push('/survey')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                📋 설문 참여하기
              </button>
            </div>

            {/* 로그아웃 버튼 */}
            <div className="mt-6">
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  logoutLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300'
                }`}
              >
                {logoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    <span>로그아웃 중...</span>
                  </>
                ) : (
                  <>
                    <span>🚪</span>
                    <span>로그아웃</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 탭 네비게이션 */}
            <div className="bg-white rounded-2xl shadow-lg mb-4">
              <div className="flex rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveTab('survey')}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors duration-200 ${
                    activeTab === 'survey'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  📋 설문 참여
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors duration-200 ${
                    activeTab === 'calendar'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  📅 일정 확인
                </button>
              </div>
            </div>

            {/* 콘텐츠 영역 */}
            {activeTab === 'survey' ? (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    설문 참여
                  </h2>
                  <p className="text-gray-600">
                    여운 공연 준비를 위한 설문에 참여해주세요
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">📋 설문 내용</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 참여 포지션 선택</li>
                      <li>• 참여 곡 선택</li>
                      <li>• 곡별 만족도 평가</li>
                      <li>• 곡별 의견 작성</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleKakaoLogin}
                    disabled={!isKakaoLoaded || loginLoading}
                    className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md ${
                      !isKakaoLoaded || loginLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {loginLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                        <span>로그인 중...</span>
                      </>
                    ) : !isKakaoLoaded ? (
                      <>
                        <span>⏳</span>
                        <span>카카오 SDK 로딩 중...</span>
                      </>
                    ) : (
                      <>
                        <span>💬</span>
                        <span>카카오톡으로 시작하기</span>
                      </>
                    )}
                  </button>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">🛡️ 개인정보 보호</h3>
                    <p className="text-sm text-blue-700">
                      로그인 정보는 설문 참여 확인 목적으로만 사용되며, 
                      별도로 저장되지 않습니다.
                    </p>
                  </div>

                  {/* SDK 로드 상태 표시 */}
                  <div className={`rounded-lg p-4 ${isKakaoLoaded ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <h3 className={`font-semibold mb-2 ${isKakaoLoaded ? 'text-green-800' : 'text-yellow-800'}`}>
                      {isKakaoLoaded ? '✅ 시스템 상태' : '⏳ 시스템 준비 중'}
                    </h3>
                    <p className={`text-sm ${isKakaoLoaded ? 'text-green-700' : 'text-yellow-700'}`}>
                      {isKakaoLoaded 
                        ? '카카오 로그인이 준비되었습니다.' 
                        : '카카오 SDK를 불러오는 중입니다...'
                      }
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    카카오톡 로그인 후 설문에 참여하실 수 있습니다
                  </p>
                </div>
              </div>
            ) : (
              <MobileCalendar />
            )}
          </>
        )}
      </div>
    </div>
  );
}
