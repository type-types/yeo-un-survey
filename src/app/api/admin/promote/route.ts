import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { targetUserId, adminUserId } = await request.json();

    // 1. 요청자가 관리자인지 확인
    if (!adminUserId) {
      return NextResponse.json(
        { error: '관리자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 요청자 권한 확인
    const requesterDoc = await adminFirestore.collection('users').doc(adminUserId).get();
    if (!requesterDoc.exists || !requesterDoc.data()?.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 2. 대상 사용자 존재 확인
    if (!targetUserId) {
      return NextResponse.json(
        { error: '대상 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const targetDoc = await adminFirestore.collection('users').doc(targetUserId).get();
    if (!targetDoc.exists) {
      return NextResponse.json(
        { error: '대상 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 관리자 권한 부여
    await adminFirestore.collection('users').doc(targetUserId).update({
      isAdmin: true,
      promotedAt: new Date(),
      promotedBy: adminUserId,
    });

    // 4. Firebase Auth Custom Claims 업데이트
    try {
      await adminAuth.setCustomUserClaims(targetUserId, {
        isAdmin: true,
        role: 'admin'
      });
    } catch (error) {
      console.warn('Custom Claims 설정 실패 (계속 진행):', error);
    }

    // 5. 로그 기록
    await adminFirestore.collection('admin_logs').add({
      action: 'PROMOTE_USER',
      adminId: adminUserId,
      targetUserId: targetUserId,
      timestamp: new Date(),
      details: {
        targetUserName: targetDoc.data()?.name || 'Unknown',
        adminUserName: requesterDoc.data()?.name || 'Unknown'
      }
    });

    console.log(`✅ 사용자 ${targetUserId} 관리자 권한 부여 완료`);

    return NextResponse.json({
      success: true,
      message: '관리자 권한이 부여되었습니다.',
      user: {
        id: targetUserId,
        name: targetDoc.data()?.name,
        isAdmin: true
      }
    });

  } catch (error: any) {
    console.error('❌ 관리자 권한 부여 실패:', error);
    return NextResponse.json(
      { 
        error: '관리자 권한 부여 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 