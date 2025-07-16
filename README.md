# 🎵 여운 공연 설문 조사 시스템

여운 공연 준비를 위한 설문 조사 웹 애플리케이션입니다.

## 🚀 주요 기능

- 🔐 **카카오 로그인**: 카카오톡 계정으로 간편 로그인
- 🎭 **포지션 선택**: 보컬, 코러스, 기타, 베이스, 드럼, 키보드 등
- 🎵 **곡 선택**: 18개 곡 중 참여 곡 선택
- 📊 **만족도 평가**: 0-10점 척도로 곡별 완성도 평가
- 💬 **의견 수집**: 곡별 상세 의견 작성
- 👨‍💼 **관리자 페이지**: 설문 결과 조회 및 분석

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Functions)
- **Auth**: Kakao Login API
- **Database**: Firebase Firestore (NoSQL)
- **Hosting**: Vercel/Firebase Hosting

## 📊 데이터베이스 구조

![ERD](docs/database-schema.md)

### 주요 컬렉션

1. **users**: 사용자 정보 (이름, 이메일, 관리자 여부)
2. **responses**: 설문 응답 (포지션, 참여 곡, 만족도, 의견)
3. **songs**: 곡 정보 (제목, 순서, 활성 여부)

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/yeo-un-survey.git
cd yeo-un-survey
npm install
```

### 2. 환경변수 설정

```bash
# .env.local 파일 생성
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-kakao-javascript-key
```

### 3. Firebase 설정

1. Firebase Console에서 프로젝트 생성
2. Authentication → Google 로그인 활성화
3. Firestore Database 생성 (테스트 모드)
4. 보안 규칙 설정

### 4. 카카오 로그인 설정

1. [카카오 개발자 센터](https://developers.kakao.com/) 앱 등록
2. 웹 플랫폼 등록: `http://localhost:3000`
3. 카카오 로그인 활성화
4. JavaScript 키를 환경변수에 설정

### 5. 개발 서버 실행

```bash
npm run dev
```

## 🎯 설문 진행 플로우

1. **로그인**: 카카오톡 계정으로 로그인
2. **환영 페이지**: 설문 안내 및 소요 시간 표시
3. **포지션 선택**: 참여 포지션 복수 선택
4. **곡 선택**: 참여 곡 다중 선택
5. **곡별 상세 입력**: 각 참여 곡에 대해
   - 세부 포지션 선택 (기타→리드/백킹, 키보드→메인/세컨)
   - 완성도 점수 입력 (0-10점)
   - 의견 작성
6. **제출 완료**: 설문 완료 및 감사 메시지

## 👨‍💼 관리자 기능

### 접근 방법

- `/admin` 경로로 접근
- 관리자 권한이 있는 사용자만 접근 가능

### 관리자 권한 설정

1. 사용자가 최소 1번 로그인
2. Firebase Console → Firestore → users 컬렉션
3. 해당 사용자 문서에 `isAdmin: true` 필드 추가

### 제공 기능

- 📊 전체 참여 통계
- 🎵 곡별 참여 현황
- 👥 포지션별 참여자 목록
- 📈 곡별 평균 완성도
- 💬 의견 모음

## 🎵 곡 목록

1. Pyramid - tonado
2. Do you like F?
3. 건물 사이에 피어난 장미
4. Malia civetz - broke boy
5. Jessie j - do it like a dude
6. Only wanna give it to you
7. Bang bang
8. Love theory (가스펠)
9. 마이클잭슨 - man in the mirror
10. When will my life begin?
11. 내 손을 잡아
12. Nothing's gonna change my love for you (+5키)
13. 내게 사랑이 뭐냐고 물어본다면
14. 그라데이션
15. Jessie j - flashlight (-1키)
16. 눈의 꽃
17. 아이와 나의바다 (듀엣) +1키(한키 올려서 F)
18. 고래 (듀엣, 리무진 서비스 버전 엄지,이무진)

## 🔒 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 정보만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 응답은 인증된 사용자만 생성, 관리자는 모든 응답 읽기 가능
    match /responses/{responseId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
  }
}
```

## 📱 반응형 디자인

- **모바일**: 설문 응답에 최적화된 터치 인터페이스
- **태블릿**: 중간 크기 화면에 맞춤형 레이아웃
- **데스크톱**: 관리자 페이지 및 상세 분석에 적합

## 🚀 배포

### Vercel 배포

```bash
npm run build
vercel --prod
```

### Firebase Hosting 배포

```bash
npm run build
firebase deploy
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍💻 개발자

프로젝트에 대한 문의사항이 있으시면 언제든지 연락주세요!

---

**여운 공연 설문 조사 시스템** - 음악으로 하나되는 순간을 위해 🎵
