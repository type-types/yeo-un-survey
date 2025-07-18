import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: 'perform-93a38',
};

function createFirebaseAdminApp() {
  // 이미 초기화된 앱이 있으면 재사용
  if (getApps().length > 0) {
    console.log('🔄 기존 Firebase Admin 앱 재사용');
    return getApps()[0];
  }

  console.log('🚀 Firebase Admin 앱 초기화 시작');

  try {
    // 서비스 계정 키가 있으면 사용
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('🔑 서비스 계정 키로 Firebase Admin 초기화');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      const app = initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseAdminConfig.projectId,
      });
      
      console.log('✅ Firebase Admin 앱 초기화 완료 (서비스 계정)');
      return app;
    } else {
      // 개발 환경에서는 프로젝트 ID만으로 초기화
      console.log('🏠 개발 모드: 프로젝트 ID로 Firebase Admin 초기화');
      const app = initializeApp({
        projectId: firebaseAdminConfig.projectId,
      });
      
      console.log('✅ Firebase Admin 앱 초기화 완료 (개발 모드)');
      return app;
    }
    
  } catch (error) {
    console.log('🔄 첫 번째 시도 실패, 대안 앱명으로 재시도');
    
    try {
      // 다른 앱명으로 재시도
      const app = initializeApp({
        projectId: firebaseAdminConfig.projectId,
      }, `admin-${Date.now()}`);
      
      console.log('✅ Firebase Admin 대안 초기화 완료');
      return app;
      
    } catch (secondError) {
      console.error('❌ Firebase Admin 초기화 최종 실패:', secondError);
      throw secondError;
    }
  }
}

// Firebase Admin 앱 초기화
let adminApp;
try {
  adminApp = createFirebaseAdminApp();
} catch (error) {
  console.error('❌ Firebase Admin 앱 생성 실패, 최후 수단 시도:', error);
  // 최후의 수단: 기본 앱 이름으로 시도
  adminApp = initializeApp({ 
    projectId: firebaseAdminConfig.projectId 
  }, 'fallback-admin');
}

// Auth와 Firestore 인스턴스 생성
export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);

console.log('✅ Firebase Admin Auth & Firestore 인스턴스 생성 완료'); 