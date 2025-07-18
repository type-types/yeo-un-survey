import { NextRequest, NextResponse } from 'next/server';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUser {
  id: number;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    email?: string;
    profile?: {
      nickname: string;
      profile_image_url?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 카카오 직접 인증 API 시작');
    
    const { authorizationCode, redirectUri } = await request.json();

    if (!authorizationCode) {
      console.error('❌ 인가 코드 누락');
      return NextResponse.json(
        { error: '인가 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 환경변수 확인
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    if (!kakaoClientId) {
      console.error('❌ 카카오 클라이언트 ID 누락');
      return NextResponse.json(
        { error: '카카오 클라이언트 ID가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('🔄 카카오 토큰 요청 시작');

    // 1. 인가 코드로 액세스 토큰 획득
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: kakaoClientId,
      redirect_uri: redirectUri,
      code: authorizationCode,
    });

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    });

    console.log('🔍 카카오 토큰 응답 상태:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ 카카오 토큰 요청 실패:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        let userFriendlyMessage = '카카오 로그인에 문제가 발생했습니다.';
        
        if (errorData.error === 'invalid_grant') {
          userFriendlyMessage = '인가 코드가 만료되었거나 잘못되었습니다. 다시 로그인해주세요.';
        } else if (errorData.error === 'invalid_client') {
          userFriendlyMessage = '카카오 앱 설정에 문제가 있습니다.';
        } else if (errorData.error === 'redirect_uri_mismatch') {
          userFriendlyMessage = '리다이렉트 URI가 일치하지 않습니다.';
        }
        
        return NextResponse.json(
          { 
            error: userFriendlyMessage,
            details: errorData.error_description || errorData.error
          },
          { status: 400 }
        );
      } catch (parseError) {
        return NextResponse.json(
          { error: '카카오 토큰 획득에 실패했습니다.', details: errorText },
          { status: 400 }
        );
      }
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();
    console.log('✅ 카카오 액세스 토큰 획득 성공');

    // 2. 액세스 토큰으로 사용자 정보 가져오기
    console.log('🔄 카카오 사용자 정보 요청');
    
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    console.log('🔍 카카오 사용자 정보 응답 상태:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ 카카오 사용자 정보 요청 실패:', errorText);
      return NextResponse.json(
        { error: '카카오 사용자 정보 획득에 실패했습니다.', details: errorText },
        { status: 400 }
      );
    }

    const kakaoUser: KakaoUser = await userResponse.json();
    console.log('✅ 카카오 사용자 정보 획득 성공 - 사용자 ID:', kakaoUser.id);

    // 3. 사용자 정보 반환 (Firebase Admin 없이)
    const userInfo = {
      kakaoId: kakaoUser.id.toString(),
      name: kakaoUser.properties.nickname || '익명',
      email: kakaoUser.kakao_account.email || '',
      profileImage: kakaoUser.properties.profile_image || '',
      provider: 'kakao',
    };

    console.log('🎉 카카오 직접 인증 완료');

    return NextResponse.json({
      success: true,
      user: userInfo,
    });

  } catch (error: any) {
    console.error('❌ 카카오 직접 인증 중 오류:', error);
    return NextResponse.json(
      { 
        error: '로그인 처리 중 오류가 발생했습니다.',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
} 