import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  signInWithCustomToken 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { useKakaoAuth } from './useKakaoAuth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { signInWithKakao: kakaoSignIn } = useKakaoAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return {
        id: firebaseUser.uid,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate() || new Date()
      } as User;
    } else {
      // 새 사용자 데이터 생성
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '익명',
        email: firebaseUser.email || '',
        profileImage: firebaseUser.photoURL || '',
        isAdmin: false,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: new Date()
      });
      
      return newUser;
    }
  };

  // 카카오 로그인
  const signInWithKakao = async () => {
    try {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
      if (!kakaoKey || kakaoKey === 'your-kakao-client-id') {
        throw new Error('카카오 로그인 설정이 필요합니다. 환경변수를 확인하세요.');
      }

      // 카카오 로그인 시도
      const kakaoUser = await kakaoSignIn();
      
      // 카카오 로그인 성공 시 Firebase에 사용자 정보 저장
      // 실제 환경에서는 서버에서 Custom Token을 생성해야 함
      // 현재는 임시로 카카오 정보만 콘솔에 출력
      console.log('카카오 로그인 성공:', kakaoUser);
      
      // TODO: 서버에서 Custom Token 생성 후 Firebase 로그인 처리
      // 현재는 에러를 던져서 사용자가 다시 시도하도록 함
      throw new Error('카카오 로그인 기능이 아직 완전히 구현되지 않았습니다. 개발자에게 문의하세요.');
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      
      // 카카오 로그인 로그아웃 처리
      if (typeof window !== 'undefined' && window.Kakao && window.Kakao.Auth.getAccessToken()) {
        window.Kakao.Auth.logout();
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithKakao,
    signOut
  };
} 