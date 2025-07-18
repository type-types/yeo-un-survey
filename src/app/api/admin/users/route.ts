import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get('adminUserId');

    // 1. 관리자 권한 확인
    if (!adminUserId) {
      return NextResponse.json(
        { error: '관리자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const adminDoc = await adminFirestore.collection('users').doc(adminUserId).get();
    if (!adminDoc.exists || !adminDoc.data()?.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 2. 모든 사용자 조회
    const usersSnapshot = await adminFirestore.collection('users').get();
    const users: any[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        provider: userData.provider,
        createdAt: userData.createdAt?.toDate() || null,
        profileImage: userData.profileImage
      });
    });

    // 3. 관리자/일반 사용자 정렬
    users.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    console.log(`✅ 관리자 ${adminUserId}가 사용자 목록 조회 (총 ${users.length}명)`);

    return NextResponse.json({
      success: true,
      users,
      stats: {
        total: users.length,
        admins: users.filter(u => u.isAdmin).length,
        regular: users.filter(u => !u.isAdmin).length
      }
    });

  } catch (error: any) {
    console.error('❌ 사용자 목록 조회 실패:', error);
    return NextResponse.json(
      { 
        error: '사용자 목록 조회 중 오류가 발생했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 