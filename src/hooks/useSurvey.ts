import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SurveyResponse, SurveyState, SongDetail, MainPosition } from '@/types';
import { SONGS } from '@/constants/songs';

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
      const responseDoc = await getDoc(doc(db, 'responses', userId));
      if (responseDoc.exists()) {
        const data = responseDoc.data() as SurveyResponse;
        setExistingResponse({
          ...data,
          submittedAt: data.submittedAt instanceof Date ? data.submittedAt : new Date(data.submittedAt),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)
        });
      }
    } catch (error) {
      console.error('기존 응답 확인 오류:', error);
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

      await setDoc(doc(db, 'responses', userId), responseData);
      setSurveyState(prev => ({ ...prev, step: 'complete' }));
      return true;
    } catch (error) {
      console.error('설문 제출 오류:', error);
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
    submitSurvey
  };
} 