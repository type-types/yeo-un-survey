'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSurvey } from '@/hooks/useSurvey';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import WelcomeStep from '@/components/survey/WelcomeStep';
import PositionStep from '@/components/survey/PositionStep';
import SongSelectionStep from '@/components/survey/SongSelectionStep';
import SongDetailStep from '@/components/survey/SongDetailStep';
import CompleteStep from '@/components/survey/CompleteStep';

// useSearchParams를 사용하는 실제 컴포넌트
function SurveyPageContent() {
  const { user, loading: authLoading, signInWithKakaoCode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kakaoLoginLoading, setKakaoLoginLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // 카카오 코드 처리 중복 방지를 위한 ref
  const processingCodeRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);

  // 카카오 로그인 리다이렉트 처리
  useEffect(() => {
    const handleKakaoCallback = async () => {
      // URL에서 인가 코드 확인
      const authorizationCode = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('❌ 카카오 로그인 오류:', error);
        alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
        router.push('/');
        return;
      }

      // 인가 코드가 있고, 상태가 로그인이며, 아직 로그인되지 않은 경우
      if (authorizationCode && state?.startsWith('login_') && !user && !authLoading) {
        
        // 중복 처리 방지 체크
        if (isProcessingRef.current || processingCodeRef.current === authorizationCode) {
          console.log('⚠️ 이미 처리 중이거나 처리된 인가 코드입니다.');
          return;
        }

        // 처리 시작 표시
        isProcessingRef.current = true;
        processingCodeRef.current = authorizationCode;
        
        console.log('🔄 카카오 인가 코드 감지, 자동 로그인 처리:', authorizationCode.substring(0, 20) + '...');
        setKakaoLoginLoading(true);

        try {
          await signInWithKakaoCode(authorizationCode);
          console.log('✅ 카카오 자동 로그인 성공');
          
          // URL에서 파라미터 제거 (깔끔한 URL을 위해)
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, '', url.toString());
          
        } catch (error: any) {
          console.error('❌ 카카오 자동 로그인 실패:', error);
          
          // 사용자 친화적인 오류 메시지
          let errorMessage = '로그인 처리 중 오류가 발생했습니다.';
          
          if (error.message.includes('인가 코드가 만료되었거나')) {
            errorMessage = '로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
          } else if (error.message.includes('Firebase Admin')) {
            errorMessage = '서버 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
          }
          
          alert(errorMessage);
          
          // URL 정리 후 홈으로 이동
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, '', url.toString());
          router.push('/');
          
        } finally {
          setKakaoLoginLoading(false);
          isProcessingRef.current = false;
        }
      }
    };

    handleKakaoCallback();
  }, [searchParams, user, authLoading, router, signInWithKakaoCode]);

  // 로그인되지 않은 상태에서 접근 시 홈으로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user && !kakaoLoginLoading && !searchParams.get('code')) {
      router.push('/');
    }
  }, [user, authLoading, kakaoLoginLoading, router, searchParams]);

  const { 
    surveyState, 
    loading: surveyLoading, 
    existingResponse,
    nextStep,
    previousStep,
    setMainPositions,
    setParticipatingSongs,
    updateSongDetail,
    nextSong,
    previousSong,
    getCurrentSong,
    isLastSong,
    submitSurvey
  } = useSurvey(user?.id || '');

  // 설문 제출 처리 함수
  const handleSubmitSurvey = async () => {
    if (!user) return;
    
    setSubmitLoading(true);
    setSubmitError(null);
    
    try {
      console.log('🔄 설문 제출 시작');
      await submitSurvey(user.name, user.profileImage);
      console.log('✅ 설문 제출 성공');
    } catch (error: any) {
      console.error('❌ 설문 제출 실패:', error);
      setSubmitError(error.message || '설문 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 설문 제출 재시도 함수
  const handleRetrySubmit = () => {
    setSubmitError(null);
    handleSubmitSurvey();
  };

  // 로딩 상태 처리
  if (authLoading || surveyLoading || kakaoLoginLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {kakaoLoginLoading ? '카카오 로그인 처리 중...' : '로딩 중...'}
          </p>
          {kakaoLoginLoading && (
            <p className="text-sm text-gray-500 mt-2">
              잠시만 기다려주세요...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 설문 제출 에러 모달
  if (submitError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            설문 제출 실패
          </h1>
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">
              {submitError}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleRetrySubmit}
              disabled={submitLoading}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                submitLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {submitLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>재시도 중...</span>
                </div>
              ) : (
                '다시 시도'
              )}
            </button>
            <button
              onClick={() => setSubmitError(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              설문으로 돌아가기
            </button>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-800 mb-2">💡 문제 해결 팁</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• 인터넷 연결 상태를 확인해주세요</li>
              <li>• 잠시 후 다시 시도해주세요</li>
              <li>• 문제가 계속되면 관리자에게 문의하세요</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 이미 응답한 경우
  if (existingResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ✅ 설문 완료
          </h1>
          <p className="text-gray-600 mb-6">
            이미 설문에 참여하셨습니다.<br />
            참여해주셔서 감사합니다!
          </p>
          <p className="text-sm text-gray-500">
            응답일: {existingResponse.submittedAt.toLocaleDateString()}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (surveyState.step) {
      case 'welcome':
        return <WelcomeStep user={user} onNext={nextStep} />;
      
      case 'positions':
        return (
          <PositionStep
            selectedPositions={surveyState.data.mainPositions || []}
            onPositionsChange={setMainPositions}
            onNext={nextStep}
            onPrevious={previousStep}
          />
        );
      
      case 'songs':
        return (
          <SongSelectionStep
            selectedSongs={surveyState.data.participatingSongs || []}
            onSongsChange={setParticipatingSongs}
            onNext={nextStep}
            onPrevious={previousStep}
          />
        );
      
      case 'details':
        return (
          <SongDetailStep
            song={getCurrentSong()}
            currentIndex={surveyState.currentSongIndex}
            totalSongs={surveyState.data.participatingSongs?.length || 0}
            mainPositions={surveyState.data.mainPositions || []}
            songDetail={surveyState.data.songDetails?.[getCurrentSong()?.id || 0]}
            onDetailChange={(detail) => updateSongDetail(getCurrentSong()?.id || 0, detail)}
            onNext={isLastSong() ? () => handleSubmitSurvey() : nextSong}
            onPrevious={surveyState.currentSongIndex === 0 ? previousStep : previousSong}
            isLastSong={isLastSong()}
            submitLoading={submitLoading}
          />
        );
      
      case 'complete':
        return <CompleteStep user={user} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {renderStep()}
    </div>
  );
}

// Suspense 경계로 감싸는 메인 컴포넌트
export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">설문조사 로딩 중...</p>
        </div>
      </div>
    }>
      <SurveyPageContent />
    </Suspense>
  );
}