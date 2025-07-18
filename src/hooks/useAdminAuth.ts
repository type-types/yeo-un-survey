import { useAuth } from './useAuth';
import { useMemo } from 'react';

export function useAdminAuth() {
  const { user, loading, ...authProps } = useAuth();

  const adminState = useMemo(() => {
    if (loading) {
      return { 
        isAdmin: false, 
        isLoading: true, 
        hasAccess: false 
      };
    }

    const isAdmin = user?.isAdmin === true;
    
    return {
      isAdmin,
      isLoading: false,
      hasAccess: isAdmin,
      user: isAdmin ? user : null,
    };
  }, [user, loading]);

  return {
    ...authProps,
    user,
    loading,
    ...adminState,
  };
}

// 관리자 권한 체크 유틸리티 함수들
export const adminUtils = {
  // 관리자 여부 확인
  isAdmin: (user: any): boolean => {
    return user?.isAdmin === true;
  },

  // 관리자 권한 요구 함수
  requireAdmin: (user: any): void => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }
    if (!adminUtils.isAdmin(user)) {
      throw new Error('관리자 권한이 필요합니다.');
    }
  },

  // 관리자용 로그
  adminLog: (message: string, data?: any): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`👨‍💼 [ADMIN] ${message}`, data || '');
    }
  },
}; 