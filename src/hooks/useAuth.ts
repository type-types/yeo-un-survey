import { useState, useEffect } from 'react';
import { User } from '@/types';
import { useKakaoAuth } from './useKakaoAuth';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// 로컬 스토리지 키
const USER_STORAGE_KEY = 'kakao_user_info';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { signInWithKakao: kakaoSignIn, signOutWithKakao, isKakaoLoaded } = useKakaoAuth();

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const restoreUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('📱 로컬 스토리지에서 사용자 정보 복원:', userData.name);
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt)
          });
        }
      } catch (error) {
        console.error('❌ 로컬 스토리지 복원 실패:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreUserFromStorage();
  }, []);

  // 카카오 로그인 (리다이렉트 방식)
  const signInWithKakao = async () => {
    try {
      // SDK 로드 확인
      if (!isKakaoLoaded) {
        throw new Error('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }

      console.log('🚀 카카오 로그인 프로세스 시작 (리다이렉트 방식)');
      
      // 리다이렉트 방식 로그인 시작
      await kakaoSignIn();
      
    } catch (error) {
      console.error('❌ 카카오 로그인 오류:', error);
      throw error;
    }
  };

  // 카카오 인가 코드로 로그인 (Firebase Authentication + 로컬 스토리지 방식)
  const signInWithKakaoCode = async (authorizationCode: string) => {
    try {
      console.log('🚀 카카오 인가 코드 로그인 처리 시작 (Firebase Authentication + 로컬 스토리지 방식)');

      // 환경별 인증 방식 분기 (저장은 모든 환경에서 Firestore 사용)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 개발 모드: 로컬 인증 + Firestore 저장');
        
        // 1. 카카오 API에서 사용자 정보 가져오기 (로컬)
        const response = await fetch('/api/auth/kakao-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            authorizationCode,
            redirectUri: `${window.location.origin}/survey`
          }),
        });

        console.log('🔍 API 응답 상태:', response.status, response.statusText);

        if (!response.ok) {
          // 상세한 오류 정보 출력
          const errorText = await response.text();
          console.error('❌ API 응답 원문:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('❌ API 오류 데이터:', errorData);
            throw new Error(errorData.error || `인가 코드 처리 실패 (${response.status}): ${errorData.details || errorText}`);
          } catch (parseError) {
            console.error('❌ JSON 파싱 실패, 원문 응답:', errorText);
            throw new Error(`인가 코드 처리 실패 (${response.status}): ${errorText}`);
          }
        }

        const { user: kakaoUserInfo } = await response.json();
        console.log('✅ 카카오 사용자 정보 획득 성공:', kakaoUserInfo);

        // 2. 사용자 정보 생성 (카카오 ID 기반)
        const userData: User = {
          id: `kakao_${kakaoUserInfo.kakaoId}`,
          name: kakaoUserInfo.name,
          email: kakaoUserInfo.email,
          profileImage: kakaoUserInfo.profileImage,
          isAdmin: false,
          provider: 'kakao',
          kakaoId: kakaoUserInfo.kakaoId,
          createdAt: new Date(),
        };

        console.log('📱 로컬 스토리지에 사용자 정보 저장');
        
        // 3. 로컬 스토리지에 저장
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        
        // 4. 상태 업데이트
        setUser(userData);

        console.log('🎉 카카오 로그인 완료 (개발 모드 - 로컬 인증 + Firestore 저장)');
        
        return userData;
        
      } else {
        // 프로덕션 환경에서는 Firebase Admin 사용
        console.log('🏭 프로덕션 모드: Firebase Authentication 사용');
        
        // 1. 카카오 API에서 사용자 정보 가져오기 및 Firebase에 등록
        const response = await fetch('/api/auth/kakao-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            authorizationCode,
            redirectUri: `${window.location.origin}/survey`
          }),
        });

        console.log('🔍 API 응답 상태:', response.status, response.statusText);

        if (!response.ok) {
          // 상세한 오류 정보 출력
          const errorText = await response.text();
          console.error('❌ API 응답 원문:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('❌ API 오류 데이터:', errorData);
            throw new Error(errorData.error || `인가 코드 처리 실패 (${response.status}): ${errorData.details || errorText}`);
          } catch (parseError) {
            console.error('❌ JSON 파싱 실패, 원문 응답:', errorText);
            throw new Error(`인가 코드 처리 실패 (${response.status}): ${errorText}`);
          }
        }

        const { user: kakaoUserInfo, customToken } = await response.json();
        console.log('✅ 카카오 사용자 정보 획득 성공:', kakaoUserInfo);
        console.log('✅ Firebase Custom Token 획득 성공');

        // 2. 사용자 정보 생성 (Firebase에서 반환된 정보 사용)
        const userData: User = {
          id: kakaoUserInfo.uid,
          name: kakaoUserInfo.name,
          email: kakaoUserInfo.email,
          profileImage: kakaoUserInfo.profileImage,
          isAdmin: false,
          provider: 'kakao',
          kakaoId: kakaoUserInfo.kakaoId,
          createdAt: new Date(),
        };

        // 3. Firebase Authentication에 로그인
        console.log('🔐 Firebase Authentication 로그인 시작');
        await signInWithCustomToken(auth, customToken);
        console.log('✅ Firebase Authentication 로그인 완료');
        
        console.log('📱 로컬 스토리지에 사용자 정보 저장');
        
        // 4. 로컬 스토리지에 저장
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        
        // 5. 상태 업데이트
        setUser(userData);

        console.log('🎉 카카오 로그인 완료 (Firebase Authentication + 로컬 스토리지 방식)');
        
        return userData;
      }

    } catch (error) {
      console.error('❌ 카카오 인가 코드 로그인 오류:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔄 로그아웃 시작');
      
      // Firebase Authentication 로그아웃
      await firebaseSignOut(auth);
      console.log('🔐 Firebase Authentication 로그아웃 완료');
      
      // 로컬 스토리지 정리
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('📱 로컬 스토리지 정리 완료');
      
      // 상태 정리
      setUser(null);
      console.log('🔄 사용자 상태 정리 완료');
      
      // 카카오 로그아웃
      await signOutWithKakao();
      console.log('✅ 카카오 로그아웃 완료');
      
      console.log('✅ 전체 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 오류:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithKakao,
    signInWithKakaoCode,
    signOut,
    isKakaoLoaded
  };
} 