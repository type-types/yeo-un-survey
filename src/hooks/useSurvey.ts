import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SurveyResponse, SurveyState, SongDetail, MainPosition } from '@/types';
import { SONGS } from '@/constants/songs';

// 로컬 스토리지 키
const SURVEY_STORAGE_KEY = 'survey_response_';

export function useSurvey(userId: string) {
  const [surveyState, setSurveyState] = useState<SurveyState>({
    step: 'welcome',
    currentSongIndex: 0,
    data: {}
  });
  const [loading, setLoading] = useState(true);
  const [existingResponse, setExistingResponse] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    if (userId) {
      checkExistingResponse();
    }
  }, [userId]);

  const checkExistingResponse = async () => {
    try {
      const storageKey = SURVEY_STORAGE_KEY + userId;
      const storedResponse = localStorage.getItem(storageKey);
      
      if (storedResponse) {
        const data = JSON.parse(storedResponse) as SurveyResponse;
        console.log('📱 기존 설문 응답 발견:', data.userName);
        setExistingResponse({
          ...data,
          submittedAt: new Date(data.submittedAt),
          updatedAt: new Date(data.updatedAt)
        });
      } else {
        console.log('📱 기존 설문 응답 없음');
      }
    } catch (error) {
      console.error('❌ 기존 응답 확인 오류:', error);
      // 오류가 발생한 경우 해당 저장소 정리
      localStorage.removeItem(SURVEY_STORAGE_KEY + userId);
    } finally {
      setLoading(false);
    }
  };

  const updateSurveyData = (updates: Partial<SurveyResponse>) => {
    setSurveyState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...updates
      }
    }));
  };

  const setMainPositions = (positions: MainPosition[]) => {
    updateSurveyData({ mainPositions: positions });
  };

  const setParticipatingSongs = (songIds: number[]) => {
    updateSurveyData({ participatingSongs: songIds });
  };

  const updateSongDetail = (songId: number, detail: Partial<SongDetail>) => {
    setSurveyState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        songDetails: {
          ...prev.data.songDetails,
          [songId]: {
            selectedPositions: [],
            completionScore: null,
            opinion: '',
            ...prev.data.songDetails?.[songId],
            ...detail
          }
        }
      }
    }));
  };

  const nextStep = () => {
    setSurveyState(prev => {
      const steps = ['welcome', 'positions', 'songs', 'details', 'complete'] as const;
      const currentIndex = steps.indexOf(prev.step);
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
      return {
        ...prev,
        step: steps[nextIndex]
      };
    });
  };

  const previousStep = () => {
    setSurveyState(prev => {
      const steps = ['welcome', 'positions', 'songs', 'details', 'complete'] as const;
      const currentIndex = steps.indexOf(prev.step);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...prev,
        step: steps[prevIndex]
      };
    });
  };

  const nextSong = () => {
    setSurveyState(prev => {
      const participatingSongs = prev.data.participatingSongs || [];
      const nextIndex = Math.min(prev.currentSongIndex + 1, participatingSongs.length - 1);
      return {
        ...prev,
        currentSongIndex: nextIndex
      };
    });
  };

  const previousSong = () => {
    setSurveyState(prev => ({
      ...prev,
      currentSongIndex: Math.max(prev.currentSongIndex - 1, 0)
    }));
  };

  const getCurrentSong = () => {
    const participatingSongs = surveyState.data.participatingSongs || [];
    const currentSongId = participatingSongs[surveyState.currentSongIndex];
    return SONGS.find(song => song.id === currentSongId);
  };

  const isLastSong = () => {
    const participatingSongs = surveyState.data.participatingSongs || [];
    return surveyState.currentSongIndex === participatingSongs.length - 1;
  };

  const submitSurvey = async (userName: string, profileImage?: string) => {
    try {
      const responseData: SurveyResponse = {
        userId,
        userName,
        profileImage,
        mainPositions: surveyState.data.mainPositions || [],
        participatingSongs: surveyState.data.participatingSongs || [],
        songDetails: surveyState.data.songDetails || {},
        submittedAt: new Date(),
        updatedAt: new Date()
      };

      console.log('✅ 설문 응답 데이터 준비 완료:', {
        사용자: userName,
        메인포지션: responseData.mainPositions.length,
        참여곡수: responseData.participatingSongs.length,
        상세응답: Object.keys(responseData.songDetails).length
      });

      // Firebase Firestore에 저장
      console.log('🏭 Firebase Firestore에 저장');
      
      try {
        // Firebase 문서 참고: setDoc으로 안전하게 저장
        await setDoc(doc(db, 'responses', userId), responseData);
        console.log('✅ Firestore에 설문 결과 저장 완료');
        
        // Firestore 저장 성공 후 로컬 스토리지에 백업
        try {
          const storageKey = SURVEY_STORAGE_KEY + userId;
          localStorage.setItem(storageKey, JSON.stringify(responseData));
          console.log('📱 로컬 스토리지 백업 저장 완료');
        } catch (localStorageError) {
          console.warn('⚠️ 로컬 스토리지 백업 저장 실패 (Firestore는 성공):', localStorageError);
        }
        
      } catch (firestoreError: any) {
        console.error('❌ Firestore 저장 실패:', firestoreError);
        
        // 구체적인 오류 메시지 제공
        let errorMessage = '설문 결과 저장에 실패했습니다.';
        
        if (firestoreError.code === 'permission-denied') {
          errorMessage = '저장 권한이 없습니다. 관리자에게 문의하세요.';
        } else if (firestoreError.code === 'unavailable') {
          errorMessage = '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
        } else if (firestoreError.code === 'deadline-exceeded') {
          errorMessage = '저장 시간이 초과되었습니다. 다시 시도해주세요.';
        } else if (firestoreError.message?.includes('network')) {
          errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
        }
        
        // 사용자에게 구체적인 오류 전달
        throw new Error(errorMessage);
      }

      // 모든 저장 성공 후 완료 단계로 이동
      setSurveyState(prev => ({ ...prev, step: 'complete' }));
      console.log('🎉 설문 제출 완료!');
      return true;

    } catch (error: any) {
      console.error('❌ 설문 제출 오류:', error);
      
      // 구체적인 오류 메시지를 상위 컴포넌트에서 처리할 수 있도록 에러 객체에 포함
      const errorWithMessage = new Error(error.message || '설문 제출 중 알 수 없는 오류가 발생했습니다.');
      errorWithMessage.name = 'SurveySubmissionError';
      throw errorWithMessage;
    }
  };

  // 설문 완료 여부 확인 함수
  const checkSurveyCompleted = (userId: string): boolean => {
    if (!userId) return false;
    
    try {
      const storageKey = SURVEY_STORAGE_KEY + userId;
      const storedResponse = localStorage.getItem(storageKey);
      return storedResponse !== null;
    } catch (error) {
      console.error('❌ 설문 완료 여부 확인 오류:', error);
      return false;
    }
  };

  return {
    surveyState,
    loading,
    existingResponse,
    updateSurveyData,
    setMainPositions,
    setParticipatingSongs,
    updateSongDetail,
    nextStep,
    previousStep,
    nextSong,
    previousSong,
    getCurrentSong,
    isLastSong,
    submitSurvey,
    checkSurveyCompleted
  };
} 