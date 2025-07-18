'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AdminProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

export default function AdminProtectedRoute({ 
  children, 
  fallbackPath = '/' 
}: AdminProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🚫 비로그인 사용자 - 홈으로 리다이렉트');
        router.push(fallbackPath);
      } else if (!user.isAdmin) {
        console.log('🚫 일반 사용자 관리자 페이지 접근 시도 - 홈으로 리다이렉트');
        alert('관리자 권한이 필요합니다.');
        router.push(fallbackPath);
      } else {
        console.log('✅ 관리자 권한 확인됨');
      }
    }
  }, [user, loading, router, fallbackPath]);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  // 권한 없음
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">접근 권한 없음</h1>
          <p className="text-gray-600 mb-6">관리자 권한이 필요한 페이지입니다.</p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 권한 있음 - 컴포넌트 렌더링
  return <>{children}</>;
} 