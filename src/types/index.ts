// 사용자 타입
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isAdmin?: boolean;
  createdAt: Date;
}

// 곡 정보 타입
export interface Song {
  id: number;
  title: string;
  order: number;
  isActive: boolean;
}

// 포지션 타입
export type MainPosition = '보컬' | '코러스' | '기타' | '베이스' | '드럼' | '키보드';

export type DetailedPosition = 
  | '보컬' 
  | '코러스' 
  | '기타 어쿠스틱' 
  | '기타 리드' 
  | '기타 백킹' 
  | '베이스' 
  | '드럼' 
  | '메인 키보드' 
  | '세컨 키보드';

// 곡별 상세 정보 타입
export interface SongDetail {
  selectedPositions: DetailedPosition[];
  completionScore: number | null;
  opinion: string;
}

// 설문 응답 타입
export interface SurveyResponse {
  id?: string;
  userId: string;
  userName: string;
  profileImage?: string;
  mainPositions: MainPosition[];
  participatingSongs: number[];
  songDetails: Record<number, SongDetail>;
  submittedAt: Date;
  updatedAt: Date;
}

// 설문 진행 상태 타입
export interface SurveyState {
  step: 'welcome' | 'positions' | 'songs' | 'details' | 'complete';
  currentSongIndex: number;
  data: Partial<SurveyResponse>;
} 