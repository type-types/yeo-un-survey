import { useEffect, useState } from 'react';

// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: any;
  }
}

export function useKakaoAuth() {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEffect(() => {
    // 카카오 SDK 초기화
    const initKakaoSDK = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
        
        if (kakaoKey && kakaoKey !== 'your-kakao-client-id') {
          // SDK가 이미 초기화되어 있는지 확인
          if (!window.Kakao.isInitialized()) {
            try {
              window.Kakao.init(kakaoKey);
              console.log('✅ 카카오 SDK 초기화 완료');
              console.log('SDK Version:', window.Kakao.VERSION);
            } catch (error) {
              console.error('❌ 카카오 SDK 초기화 실패:', error);
              return;
            }
          }
          
          // SDK가 완전히 로드되었는지 확인
          if (window.Kakao.Auth && window.Kakao.API) {
            setIsKakaoLoaded(true);
            console.log('✅ 카카오 SDK 로드 완료');
            
            // 🔍 카카오 SDK 구조 디버깅 (개발 환경에서만)
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 Kakao.Auth 메소드들:', Object.getOwnPropertyNames(window.Kakao.Auth));
              const authMethods = Object.getOwnPropertyNames(window.Kakao.Auth).filter(
                key => typeof window.Kakao.Auth[key] === 'function'
              );
              console.log('🔍 Kakao.Auth 함수들:', authMethods);
            }
            
          } else {
            console.log('⏳ 카카오 SDK 모듈 로딩 중...');
            setTimeout(initKakaoSDK, 100);
          }
        } else {
          console.error('❌ 카카오 클라이언트 ID가 설정되지 않았습니다');
        }
      } else {
        console.log('⏳ 카카오 SDK 로딩 대기 중...');
        setTimeout(initKakaoSDK, 100);
      }
    };

    initKakaoSDK();
  }, []);

  const signInWithKakao = async () => {
    return new Promise((resolve, reject) => {
      try {
        // SDK 로드 확인
        if (!isKakaoLoaded) {
          reject(new Error('카카오 SDK가 아직 로드되지 않았습니다.'));
          return;
        }

        if (!window.Kakao || !window.Kakao.Auth) {
          reject(new Error('카카오 Auth 모듈을 찾을 수 없습니다.'));
          return;
        }

        console.log('🚀 카카오 로그인 시작');

        // authorize 메소드를 사용한 리다이렉트 방식 로그인
        if (typeof window.Kakao.Auth.authorize === 'function') {
          console.log('✅ authorize 메소드를 사용한 리다이렉트 로그인');
          
          // 리다이렉트 URI 설정 (카카오 앱에 등록된 URI와 동일해야 함)
          const redirectUri = `${window.location.origin}/`;
          
          // state 파라미터로 로그인 상태 구분
          const state = `login_${Date.now()}`;
          
          // authorize 호출 - 카카오 로그인 페이지로 리다이렉트
          window.Kakao.Auth.authorize({
            redirectUri: redirectUri,
            state: state
          });
          
          // 리다이렉트이므로 Promise는 여기서 완료되지 않음
          // 실제 로그인 처리는 리다이렉트된 페이지에서 수행
          
        } else if (typeof window.Kakao.Auth.login === 'function') {
          console.log('✅ login 메소드 사용 가능 (팝업 방식)');
          
          // 팝업 방식 로그인 (구버전 호환)
          window.Kakao.Auth.login({
            success: function(authObj: any) {
              console.log('✅ 카카오 인증 성공:', authObj);
              
              // 사용자 정보 가져오기
              window.Kakao.API.request({
                url: '/v2/user/me',
                success: function(response: any) {
                  console.log('✅ 사용자 정보 가져오기 성공:', response);
                  resolve(response);
                },
                fail: function(error: any) {
                  console.error('❌ 사용자 정보 가져오기 실패:', error);
                  reject(new Error(`사용자 정보 가져오기 실패: ${error.msg || error.error_description}`));
                }
              });
            },
            fail: function(err: any) {
              console.error('❌ 카카오 로그인 실패:', err);
              reject(new Error(`카카오 로그인 실패: ${err.error_description || err.error}`));
            }
          });
          
        } else {
          console.error('❌ 사용 가능한 로그인 메소드를 찾을 수 없습니다');
          reject(new Error('카카오 로그인 메소드를 찾을 수 없습니다.'));
        }

      } catch (error) {
        console.error('❌ 카카오 로그인 예외:', error);
        reject(error);
      }
    });
  };

  // 인가 코드로 사용자 정보 가져오기 (리다이렉트 후 호출)
  const getKakaoUserFromCode = async (authorizationCode: string) => {
    try {
      console.log('🔄 인가 코드로 사용자 정보 요청:', authorizationCode);
      
      // 클라이언트에서 직접 토큰 교환은 보안상 권장되지 않으므로
      // 서버 API를 통해 처리하도록 수정
      const response = await fetch('/api/auth/kakao-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          authorizationCode,
          redirectUri: `${window.location.origin}/`
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }

      const userData = await response.json();
      console.log('✅ 사용자 정보 획득 성공:', userData);
      
      return userData;
      
    } catch (error) {
      console.error('❌ 인가 코드 처리 실패:', error);
      throw error;
    }
  };

  // 카카오 로그아웃
  const signOutWithKakao = () => {
    return new Promise((resolve, reject) => {
      if (!window.Kakao || !window.Kakao.Auth) {
        resolve(true);
        return;
      }

      // 카카오 로그아웃
      if (window.Kakao.Auth.getAccessToken()) {
        window.Kakao.Auth.logout(() => {
          console.log('✅ 카카오 로그아웃 완료');
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  };

  // 연결 끊기 (선택사항)
  const unlinkKakao = () => {
    return new Promise((resolve, reject) => {
      if (!window.Kakao || !window.Kakao.API) {
        resolve(true);
        return;
      }

      window.Kakao.API.request({
        url: '/v1/user/unlink',
        success: function(response: any) {
          console.log('✅ 카카오 연결 끊기 성공:', response);
          resolve(response);
        },
        fail: function(error: any) {
          console.error('❌ 카카오 연결 끊기 실패:', error);
          reject(error);
        }
      });
    });
  };

  return {
    signInWithKakao,
    getKakaoUserFromCode,
    signOutWithKakao,
    unlinkKakao,
    isKakaoLoaded
  };
} 