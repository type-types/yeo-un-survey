import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';

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
    const { kakaoUser }: { kakaoUser: KakaoUser } = await request.json();

    if (!kakaoUser || !kakaoUser.id) {
      return NextResponse.json(
        { error: '유효하지 않은 카카오 사용자 정보입니다.' },
        { status: 400 }
      );
    }

    // 카카오 사용자 ID를 Firebase UID로 변환 (kakao_ 접두사 추가)
    const firebaseUid = `kakao_${kakaoUser.id}`;
    
    // 사용자 정보 준비
    const userInfo = {
      name: kakaoUser.properties.nickname || '익명',
      email: kakaoUser.kakao_account.email || '',
      profileImage: kakaoUser.properties.profile_image || '',
      provider: 'kakao',
      kakaoId: kakaoUser.id.toString(),
    };

    // Custom Claims 설정 (선택사항)
    const customClaims = {
      provider: 'kakao',
      kakaoId: kakaoUser.id.toString(),
    };

    try {
      // 기존 사용자 확인
      await adminAuth.getUser(firebaseUid);
      console.log('기존 사용자 발견:', firebaseUid);
      
      // 기존 사용자라면 Custom Claims 업데이트
      await adminAuth.setCustomUserClaims(firebaseUid, customClaims);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('새 사용자 생성:', firebaseUid);
        
        // 새 사용자 생성
        await adminAuth.createUser({
          uid: firebaseUid,
          displayName: userInfo.name,
          email: userInfo.email || undefined,
          photoURL: userInfo.profileImage || undefined,
        });

        // Custom Claims 설정
        await adminAuth.setCustomUserClaims(firebaseUid, customClaims);

        // Firestore에 사용자 정보 저장
        await adminFirestore.collection('users').doc(firebaseUid).set({
          id: firebaseUid,
          name: userInfo.name,
          email: userInfo.email,
          profileImage: userInfo.profileImage,
          isAdmin: false,
          provider: 'kakao',
          kakaoId: userInfo.kakaoId,
          createdAt: new Date(),
        });

        console.log('새 사용자 Firestore에 저장 완료');
      } else {
        console.error('사용자 확인 중 오류:', error);
        throw error;
      }
    }

    // Custom Token 생성
    const customToken = await adminAuth.createCustomToken(firebaseUid, customClaims);
    console.log('Custom Token 생성 완료');

    return NextResponse.json({
      success: true,
      customToken,
      user: {
        uid: firebaseUid,
        ...userInfo,
      },
    });

  } catch (error: any) {
    console.error('카카오 로그인 처리 오류:', error);
    return NextResponse.json(
      { 
        error: '로그인 처리 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 