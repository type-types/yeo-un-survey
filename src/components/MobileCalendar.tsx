'use client';

import { useState, useRef, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'performance' | 'practice' | 'meeting' | 'rehearsal' | 'other';
      details?: {
      participants?: string[];
      songs?: string[];
      location?: string;
      locationUrl?: string;
      time?: string;
      price?: string;
      description?: string;
    };
}

// 샘플 이벤트 데이터 (여운 공연 관련)
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '여운 공연 연습',
    date: new Date(2024, 11, 15), // 12월 15일
    type: 'practice'
  },
  {
    id: '2', 
    title: '여운 공연 본 공연',
    date: new Date(2024, 11, 20), // 12월 20일
    type: 'performance'
  },
  {
    id: '3',
    title: '설문 마감',
    date: new Date(2024, 11, 10), // 12월 10일
    type: 'other'
  },
  {
    id: '4',
    title: '팀 회의',
    date: new Date(2024, 11, 8), // 12월 8일
    type: 'meeting'
  },
  // 7월 합주 일정 추가
  {
    id: '5',
    title: '토요일 합주',
    date: new Date(2025, 6, 19), // 2025년 7월 19일 (토)
    type: 'rehearsal',
    details: {
      participants: ['진원', '승현', '민석', '별', '예함', '영헌', '서윤', '장우', '상훈'],
      songs: ['내게 사랑이 뭐냐고 물어본다면', 'Nothing\'s gonna change my love for you', '아이와 나의 바다'],
      location: '사운드 시티 합주실 홍대점',
      locationUrl: 'https://naver.me/GFBN74CP',
      time: '오전 10시 ~ 정오',
      price: '38,000원'
    }
  },
  {
    id: '6',
    title: '일요일 합주',
    date: new Date(2025, 6, 20), // 2025년 7월 20일 (일)
    type: 'rehearsal',
    details: {
      participants: ['태연', '수진', '지원', '민석', '별', '서윤', '장우', '상훈', '영헌', '예함'],
      songs: ['Broke boy', 'Only wanna give it to you', 'Bang bang', '남는시간에 기악곡'],
      location: '그라운드 본점 A1룸',
      locationUrl: 'https://naver.me/xzxmXyI3',
      time: '오후 5~8시',
      price: '모름'
    }
  }
];

export default function MobileCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<CalendarEvent[]>(sampleEvents);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 스와이프 제스처 최소 거리
  const minSwipeDistance = 50;

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 해당 월의 첫 번째 날과 마지막 날 계산
  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    return { firstDayWeekday, daysInMonth, year, month };
  };

  // 이전/다음 월로 이동
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 특정 날짜의 이벤트 확인
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setShowEventModal(true);
    }
  };

  // 이벤트 타입별 색상
  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'performance': return 'bg-red-500';
      case 'practice': return 'bg-blue-500';
      case 'meeting': return 'bg-green-500';
      case 'rehearsal': return 'bg-orange-500';
      case 'other': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // 이벤트 타입별 아이콘
  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'performance': return '🎭';
      case 'practice': return '🎵';
      case 'meeting': return '👥';
      case 'rehearsal': return '🎸';
      case 'other': return '📝';
      default: return '📅';
    }
  };

  // 터치 이벤트 핸들러
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateMonth('next');
    } else if (isRightSwipe) {
      navigateMonth('prev');
    }
  };

  const { firstDayWeekday, daysInMonth, year, month } = getMonthData(currentDate);

  // 달력 렌더링용 날짜 배열 생성
  const renderCalendarDays = () => {
    const days = [];
    
    // 이전 월의 빈 칸들
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 flex items-center justify-center">
          <span className="text-gray-300"></span>
        </div>
      );
    }

    // 현재 월의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`h-12 flex flex-col items-center justify-center relative cursor-pointer transition-colors
            ${isToday ? 'bg-blue-100 rounded-lg' : hasEvents ? 'hover:bg-orange-50 rounded-lg' : 'hover:bg-gray-50 rounded-lg'}
            ${hasEvents ? 'ring-1 ring-orange-200' : ''}
          `}
          onClick={() => handleDateClick(date)}
        >
          <span className={`text-sm font-medium ${isToday ? 'text-blue-600 font-bold' : hasEvents ? 'text-orange-600 font-semibold' : 'text-gray-800'}`}>
            {day}
          </span>
          
          {/* 이벤트 인디케이터 */}
          {dayEvents.length > 0 && (
            <div className="flex space-x-1 mt-1">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={event.id}
                  className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.type)}`}
                  title={event.title}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${dayEvents.length - 3}개 더`} />
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // 선택된 날짜의 이벤트 목록
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // 오늘의 이벤트 목록
  const todayEvents = getEventsForDate(new Date());

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="이전 달"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-bold text-gray-800">
            {year}년 {monthNames[month]}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="다음 달"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className={`text-sm font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div
          ref={calendarRef}
          className="grid grid-cols-7 gap-1 mb-6"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {renderCalendarDays()}
        </div>

        {/* 스와이프 힌트 */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500">
            ← 스와이프하여 월 이동 → | 📅 일정이 있는 날짜를 클릭하세요
          </p>
        </div>

        {/* 이벤트 범례 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">🎵 일정 구분</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">공연</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">연습</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">합주</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">회의</span>
            </div>
          </div>
        </div>

        {/* 오늘의 이벤트 */}
        {todayEvents.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">📅 오늘의 일정</h3>
            <div className="space-y-2">
              {todayEvents.map(event => (
                <div key={event.id} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}></div>
                  <span className="text-sm text-blue-700">{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 이벤트 상세 모달 */}
      {showEventModal && selectedDate && (
        <div 
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]"
          onClick={() => setShowEventModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 이벤트 목록 */}
              <div className="space-y-4">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl">{getEventIcon(event.type)}</span>
                      <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    </div>

                    {event.details && (
                      <div className="space-y-3 text-sm text-gray-600">
                        {event.details.time && (
                          <div className="flex items-start space-x-2">
                            <span className="text-blue-500">🕒</span>
                            <div>
                              <span className="font-medium">시간:</span> {event.details.time}
                            </div>
                          </div>
                        )}

                        {event.details.location && (
                          <div className="flex items-start space-x-2">
                            <span className="text-green-500">📍</span>
                            <div className="flex-1">
                              <div>
                                <span className="font-medium">장소:</span> {event.details.location}
                              </div>
                              {event.details.locationUrl && (
                                <a
                                  href={event.details.locationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center mt-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition-colors"
                                >
                                  <span className="mr-1">🗺️</span>
                                  위치 보기
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {event.details.participants && (
                          <div className="flex items-start space-x-2">
                            <span className="text-purple-500">👥</span>
                            <div>
                              <span className="font-medium">참여자 ({event.details.participants.length}명):</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {event.details.participants.map((participant, index) => (
                                  <span
                                    key={index}
                                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                                  >
                                    {participant}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {event.details.songs && (
                          <div className="flex items-start space-x-2">
                            <span className="text-orange-500">🎵</span>
                            <div>
                              <span className="font-medium">연주곡:</span>
                              <ul className="mt-1 space-y-1">
                                {event.details.songs.map((song, index) => (
                                  <li key={index} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">
                                    {song}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {event.details.price && (
                          <div className="flex items-start space-x-2">
                            <span className="text-red-500">💰</span>
                            <div>
                              <span className="font-medium">비용:</span> {event.details.price}
                            </div>
                          </div>
                        )}

                        {event.details.description && (
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-500">📝</span>
                            <div>
                              <span className="font-medium">메모:</span> {event.details.description}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 모달 푸터 */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 