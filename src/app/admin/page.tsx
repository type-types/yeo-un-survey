'use client';

import { useAdminAuth, adminUtils } from '@/hooks/useAdminAuth';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SurveyResponse } from '@/types';
import { SONGS } from '@/constants/songs';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

function AdminPageContent() {
  const { user, hasAccess } = useAdminAuth();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasAccess && user) {
      adminUtils.adminLog('관리자 페이지 접근', { userId: user.id, name: user.name });
      fetchResponses();
    }
  }, [hasAccess, user]);

  const fetchResponses = async () => {
    try {
      adminUtils.requireAdmin(user);
      adminUtils.adminLog('설문 응답 데이터 조회 시작');
      
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
      adminUtils.adminLog('설문 응답 데이터 조회 완료', { count: responsesData.length });
      
    } catch (err: any) {
      console.error('응답 데이터 가져오기 실패:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">데이터 로드 오류</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            다시 시도
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
        {/* 관리자 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🎵 여운 공연 설문 결과 관리
              </h1>
              <p className="text-blue-100">
                관리자: {user?.name} | 총 {responses.length}명 참여
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-sm">관리자 권한</div>
                <div className="text-lg font-bold">✅ 활성화</div>
              </div>
            </div>
          </div>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">⭐ 평균 점수</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {(() => {
                const allScores: number[] = [];
                responses.forEach(response => {
                  Object.values(response.songDetails).forEach(detail => {
                    if (detail.completionScore !== null) {
                      allScores.push(detail.completionScore);
                    }
                  });
                });
                return allScores.length > 0 
                  ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1)
                  : '0.0';
              })()}점
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
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">참여자</div>
                      <div className="text-lg font-bold text-blue-600">{participants.length}명</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">평균 점수</div>
                      <div className="text-lg font-bold text-green-600">{averageScore}점</div>
                    </div>
                  </div>
                </div>

                {participants.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    아직 참여자가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participants.map((participant, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          {participant.user.profileImage && (
                            <img 
                              src={participant.user.profileImage} 
                              alt="프로필" 
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span className="font-semibold text-gray-800">
                            {participant.user.userName}
                          </span>
                          <div className="flex gap-2">
                            {participant.positions.map((position, posIndex) => (
                              <span 
                                key={posIndex}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {position}
                              </span>
                            ))}
                          </div>
                          {participant.score !== null && (
                            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full ml-auto">
                              {participant.score}점
                            </span>
                          )}
                        </div>
                        {participant.opinion && (
                          <div className="text-gray-600 text-sm bg-white p-3 rounded border-l-4 border-blue-500">
                            {participant.opinion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProtectedRoute>
      <AdminPageContent />
    </AdminProtectedRoute>
  );
} 