import { Song, DetailedPosition } from '@/types';

export const SONGS: Song[] = [
  { id: 1, title: "Pyramid - tonado", order: 1, isActive: true },
  { id: 2, title: "Do you like F?", order: 2, isActive: true },
  { id: 3, title: "건물 사이에 피어난 장미", order: 3, isActive: true },
  { id: 4, title: "Malia civetz - broke boy", order: 4, isActive: true },
  { id: 5, title: "Jessie j - do it like a dude", order: 5, isActive: true },
  { id: 6, title: "Only wanna give it to you", order: 6, isActive: true },
  { id: 7, title: "Bang bang", order: 7, isActive: true },
  { id: 8, title: "Love theory (가스펠)", order: 8, isActive: true },
  { id: 9, title: "마이클잭슨 - man in the mirror", order: 9, isActive: true },
  { id: 10, title: "When will my life begin?", order: 10, isActive: true },
  { id: 11, title: "내 손을 잡아", order: 11, isActive: true },
  { id: 12, title: "Nothing's gonna change my love for you (+5키)", order: 12, isActive: true },
  { id: 13, title: "내게 사랑이 뭐냐고 물어본다면", order: 13, isActive: true },
  { id: 14, title: "그라데이션", order: 14, isActive: true },
  { id: 15, title: "Jessie j - flashlight (-1키)", order: 15, isActive: true },
  { id: 16, title: "눈의 꽃", order: 16, isActive: true },
  { id: 17, title: "아이와 나의바다 (듀엣) +1키(한키 올려서 F)", order: 17, isActive: true },
  { id: 18, title: "고래 (듀엣, 리무진 서비스 버전 엄지,이무진)", order: 18, isActive: true },
];

export const MAIN_POSITIONS = ['보컬', '코러스', '기타', '베이스', '드럼', '키보드'] as const;

export const DETAILED_POSITIONS = [
  '보컬',
  '코러스', 
  '기타 어쿠스틱',
  '기타 리드',
  '기타 백킹',
  '베이스',
  '드럼',
  '메인 키보드',
  '세컨 키보드'
] as const;

// 메인 포지션에서 세부 포지션으로 변환하는 함수
export function getDetailedPositions(mainPositions: string[]): DetailedPosition[] {
  const detailedPositions: DetailedPosition[] = [];
  
  mainPositions.forEach(position => {
    if (position === '기타') {
      detailedPositions.push('기타 어쿠스틱', '기타 리드', '기타 백킹');
    } else if (position === '키보드') {
      detailedPositions.push('메인 키보드', '세컨 키보드');
    } else {
      detailedPositions.push(position as DetailedPosition);
    }
  });
  
  return detailedPositions;
} 