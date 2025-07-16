'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSurvey } from '@/hooks/useSurvey';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WelcomeStep from '@/components/survey/WelcomeStep';
import PositionStep from '@/components/survey/PositionStep';
import SongSelectionStep from '@/components/survey/SongSelectionStep';
import SongDetailStep from '@/components/survey/SongDetailStep';
import CompleteStep from '@/components/survey/CompleteStep';

export default function SurveyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

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

  if (authLoading || surveyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
            onNext={isLastSong() ? () => submitSurvey(user.name, user.profileImage) : nextSong}
            onPrevious={surveyState.currentSongIndex === 0 ? previousStep : previousSong}
            isLastSong={isLastSong()}
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