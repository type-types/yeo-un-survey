import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // URL에서 userId 파라미터 추출
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId가 필요합니다.' }, { status: 400 });
    }

    console.log('🔍 설문 완료 여부 확인 시작:', userId);

    // Firestore에서 해당 사용자의 설문 응답 확인
    const responseDoc = await adminFirestore.collection('responses').doc(userId).get();
    
    const isCompleted = responseDoc.exists;
    
    console.log('✅ 설문 완료 여부 확인 완료:', {
      userId,
      isCompleted,
      hasData: responseDoc.exists
    });

    return NextResponse.json({
      success: true,
      isCompleted,
      responseData: isCompleted ? {
        submittedAt: responseDoc.data()?.submittedAt?.toDate(),
        userName: responseDoc.data()?.userName
      } : null
    });

  } catch (error: any) {
    console.error('❌ 설문 완료 여부 확인 중 오류:', error);
    return NextResponse.json(
      { error: '설문 완료 여부 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 