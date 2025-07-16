'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SurveyResponse } from '@/types';
import { SONGS } from '@/constants/songs';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user && !user.isAdmin) {
      setError('관리자 권한이 필요합니다.');
    } else if (user && user.isAdmin) {
      fetchResponses();
    }
  }, [user, authLoading, router]);

  const fetchResponses = async () => {
    try {
      const q = query(collection(db, 'responses'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const responsesData: SurveyResponse[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        responsesData.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as SurveyResponse);
      });
      
      setResponses(responsesData);
    } catch (err) {
      console.error('응답 데이터 가져오기 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const getSongParticipants = (songId: number) => {
    const participants: Array<{
      user: SurveyResponse;
      positions: string[];
      score: number | null;
      opinion: string;
    }> = [];

    responses.forEach(response => {
      if (response.participatingSongs.includes(songId)) {
        const songDetail = response.songDetails[songId];
        if (songDetail) {
          participants.push({
            user: response,
            positions: songDetail.selectedPositions,
            score: songDetail.completionScore,
            opinion: songDetail.opinion
          });
        }
      }
    });

    return participants;
  };

  const getAverageScore = (songId: number) => {
    const participants = getSongParticipants(songId);
    const scores = participants.map(p => p.score).filter(s => s !== null) as number[];
    
    if (scores.length === 0) return "0.0";
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎵 여운 공연 설문 결과
          </h1>
          <p className="text-gray-600">
            총 {responses.length}명이 설문에 참여했습니다.
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📊 참여자 수</h3>
            <p className="text-2xl font-bold text-blue-600">{responses.length}명</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🎵 활성 곡 수</h3>
            <p className="text-2xl font-bold text-green-600">{SONGS.length}곡</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">💬 총 의견 수</h3>
            <p className="text-2xl font-bold text-purple-600">
              {responses.reduce((total, response) => 
                total + Object.values(response.songDetails).filter(detail => detail.opinion.trim()).length, 0
              )}개
            </p>
          </div>
        </div>

        {/* 곡별 결과 */}
        <div className="space-y-6">
          {SONGS.map(song => {
            const participants = getSongParticipants(song.id);
            const averageScore = getAverageScore(song.id);
            
            return (
              <div key={song.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {song.id}. {song.title}
                  </h2>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">참여자 수</div>
                    <div className="text-lg font-bold text-blue-600">{participants.length}명</div>
                  </div>
                </div>

                {participants.length > 0 && (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">평균 완성도:</span>
                        <span className="ml-2 text-lg font-bold text-green-600">{averageScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-2 rounded-full"
                          style={{ width: `${(parseFloat(averageScore) / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 포지션별 참여자 */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">👥 포지션별 참여자</h4>
                        <div className="space-y-2">
                          {participants.map((participant, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{participant.user.userName}</span>
                                <div className="text-sm text-gray-600">
                                  {participant.positions.join(', ')}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-semibold text-blue-600">
                                  {participant.score}/10
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 의견 모음 */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">💭 의견 모음</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {participants
                            .filter(p => p.opinion.trim())
                            .map((participant, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded">
                                <div className="text-sm font-medium text-gray-700 mb-1">
                                  {participant.user.userName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {participant.opinion}
                                </div>
                              </div>
                            ))}
                          {participants.filter(p => p.opinion.trim()).length === 0 && (
                            <p className="text-sm text-gray-500 italic">의견이 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {participants.length === 0 && (
                  <p className="text-gray-500 italic">참여자가 없습니다.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 