import { useEffect, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

export function useKakaoAuth() {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEffect(() => {
    // 카카오 SDK 로드 상태 체크
    const checkKakaoSDK = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
        if (kakaoKey && kakaoKey !== 'your-kakao-client-id') {
          if (!window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
            console.log('카카오 SDK 초기화 완료');
          }
          setIsKakaoLoaded(true);
        }
      } else {
        // SDK가 아직 로드되지 않았다면 100ms 후 다시 체크
        setTimeout(checkKakaoSDK, 100);
      }
    };

    checkKakaoSDK();
  }, []);

  const signInWithKakao = async () => {
    try {
      // SDK 로드 상태 체크
      if (!isKakaoLoaded) {
        // SDK 로드를 기다림
        return new Promise((resolve, reject) => {
          const waitForKakao = () => {
            if (isKakaoLoaded) {
              resolve(performKakaoLogin());
            } else {
              setTimeout(waitForKakao, 100);
            }
          };
          waitForKakao();
        });
      }

      return await performKakaoLogin();
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      throw error;
    }
  };

  const performKakaoLogin = async () => {
    if (!window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다.');
    }

    if (!window.Kakao.Auth) {
      throw new Error('카카오 Auth 모듈이 로드되지 않았습니다.');
    }

    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    if (!kakaoKey || kakaoKey === 'your-kakao-client-id') {
      throw new Error('카카오 클라이언트 ID가 설정되지 않았습니다.');
    }

    return new Promise((resolve, reject) => {
      window.Kakao.Auth.login({
        success: async (response: any) => {
          try {
            // 카카오 사용자 정보 가져오기
            window.Kakao.API.request({
              url: '/v2/user/me',
              success: async (userInfo: any) => {
                console.log('카카오 사용자 정보:', userInfo);
                
                // 여기서 Firebase Custom Token을 생성하고 로그인
                // 실제 구현에서는 서버에서 Custom Token을 생성해야 함
                // 현재는 임시로 Google 로그인으로 리다이렉트
                console.log('카카오 로그인 성공, 사용자 정보:', userInfo);
                resolve(userInfo);
              },
              fail: (error: any) => {
                console.error('카카오 사용자 정보 요청 실패:', error);
                reject(error);
              }
            });
          } catch (error) {
            console.error('Firebase 로그인 오류:', error);
            reject(error);
          }
        },
        fail: (error: any) => {
          console.error('카카오 로그인 실패:', error);
          reject(error);
        }
      });
    });
  };

  return {
    signInWithKakao,
    isKakaoLoaded
  };
} 