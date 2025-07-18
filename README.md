# 🎵 여운 공연 설문 조사 시스템

여운 공연 준비를 위한 설문 조사 웹 애플리케이션입니다.

## 🚀 주요 기능

- 🔐 **카카오 로그인**: 카카오톡 계정으로 간편 로그인
- 🎭 **포지션 선택**: 보컬, 코러스, 기타, 베이스, 드럼, 키보드 등
- 🎵 **곡 선택**: 18개 곡 중 참여 곡 선택
- 📊 **만족도 평가**: 0-10점 척도로 곡별 완성도 평가
- 💬 **의견 수집**: 곡별 상세 의견 작성
- 👨‍💼 **관리자 페이지**: 설문 결과 조회 및 분석
- 📅 **모바일 달력**: 공연 일정 확인

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Functions)
- **Auth**: Kakao Login API
- **Database**: Firebase Firestore (NoSQL)
- **Hosting**: Vercel/Firebase Hosting
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
yeo-un-survey/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── admin/               # 관리자 페이지
│   │   ├── api/                 # API Routes
│   │   │   ├── admin/          # 관리자 API
│   │   │   ├── auth/           # 인증 API (카카오)
│   │   │   └── survey/         # 설문 API
│   │   ├── survey/             # 설문 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── page.tsx            # 홈페이지
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── survey/            # 설문 관련 컴포넌트
│   │   ├── AdminProtectedRoute.tsx
│   │   └── MobileCalendar.tsx
│   ├── hooks/                  # 커스텀 React 훅
│   │   ├── useAuth.ts         # 인증 훅
│   │   ├── useKakaoAuth.ts    # 카카오 로그인 훅
│   │   └── useSurvey.ts       # 설문 훅
│   ├── lib/                   # 라이브러리 설정
│   │   ├── firebase.ts        # Firebase 클라이언트 설정
│   │   └── firebase-admin.ts  # Firebase Admin SDK
│   ├── types/                 # TypeScript 타입 정의
│   └── constants/             # 상수 (곡 목록 등)
├── docs/                      # 문서
├── public/                    # 정적 파일
└── 설정 파일들...
```

## 📊 데이터베이스 구조

자세한 내용은 [데이터베이스 스키마 문서](docs/database-schema.md)를 참조하세요.

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

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 카카오 로그인 설정
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-kakao-javascript-key

# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (서버사이드용)
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication → Sign-in method → Google 로그인 활성화
3. Firestore Database 생성 (테스트 모드로 시작)
4. 프로젝트 설정 → 일반 → Firebase SDK 스니펫에서 구성 정보 복사
5. 보안 규칙 설정 (아래 참조)

### 4. 카카오 로그인 설정

1. [카카오 개발자 센터](https://developers.kakao.com/)에서 앱 등록
2. **웹 플랫폼 등록**: `http://localhost:3000`
3. **카카오 로그인 활성화**: ON
4. **Redirect URI 설정**:
   - `http://localhost:3000/survey`
   - `http://localhost:3000` (옵션)
5. **동의 항목 설정**:
   - 닉네임 (필수)
   - 프로필 사진 (선택)
   - 카카오계정 이메일 (선택)
6. JavaScript 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_CLIENT_ID`에 설정

> 📋 **상세한 카카오 설정 가이드**: [check-kakao-setup.md](check-kakao-setup.md) 파일을 참조하세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 📡 API 엔드포인트

### 인증 API

- `POST /api/auth/kakao` - 카카오 로그인 토큰 검증
- `GET /api/auth/kakao-callback` - 카카오 로그인 콜백
- `POST /api/auth/kakao-direct` - 직접 카카오 로그인

### 설문 API

- `POST /api/survey/submit` - 설문 응답 제출
- `GET /api/survey/check` - 설문 완료 여부 확인

### 관리자 API

- `GET /api/admin/users` - 사용자 목록 조회
- `POST /api/admin/promote` - 사용자 관리자 권한 부여

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

Firebase Firestore 보안 규칙:

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

    // 곡 정보는 모든 인증된 사용자가 읽기 가능
    match /songs/{songId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 📱 반응형 디자인

- **모바일**: 설문 응답에 최적화된 터치 인터페이스
- **태블릿**: 중간 크기 화면에 맞춤형 레이아웃
- **데스크톱**: 관리자 페이지 및 상세 분석에 적합

## 🚀 배포

### Vercel 배포 (권장)

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com/)에서 프로젝트 import
3. 환경변수 설정:
   - Settings → Environment Variables
   - `.env.local`의 모든 환경변수 추가
4. 자동 배포 완료

### Firebase Hosting 배포

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init hosting

# 빌드 및 배포
npm run build
firebase deploy
```

## 🛠️ 트러블슈팅

### 카카오 로그인 오류

**KOE101 오류 (앱이 제대로 구성되지 않음)**:

1. 카카오 개발자 센터에서 앱 키 확인
2. Redirect URI 설정 확인: `http://localhost:3000/survey`
3. 웹 플랫폼 등록 확인: `http://localhost:3000`
4. 카카오 로그인 활성화 여부 확인

**SDK 로딩 오류**:

```bash
# 캐시 삭제 후 재시작
rm -rf .next
npm run dev
```

### Firebase 연결 오류

**환경변수 확인**:

```bash
# .env.local 파일이 있는지 확인
ls -la .env.local

# 환경변수가 제대로 로드되는지 확인
npm run dev
```

**보안 규칙 오류**:

- Firebase Console → Firestore Database → Rules에서 규칙 확인
- 테스트 모드로 임시 설정 후 점진적으로 규칙 적용

### 일반적인 오류

**의존성 오류**:

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

**포트 충돌**:

```bash
# 다른 포트로 실행
npm run dev -- -p 3001
```

## 🧪 테스트

### 개발 환경 테스트

1. 카카오 로그인 기능 테스트
2. 설문 제출 및 저장 테스트
3. 관리자 페이지 접근 테스트
4. 반응형 디자인 테스트

### 프로덕션 배포 전 체크리스트

- [ ] 환경변수 설정 완료
- [ ] Firebase 보안 규칙 적용
- [ ] 카카오 앱 프로덕션 도메인 등록
- [ ] 관리자 계정 설정
- [ ] 곡 목록 최신화

## 📈 성능 최적화

- Next.js 15의 최신 최적화 기능 활용
- Tailwind CSS로 CSS 번들 크기 최소화
- Firebase Firestore 쿼리 최적화
- 이미지 최적화 (Next.js Image 컴포넌트)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍💻 개발자

프로젝트에 대한 문의사항이 있으시면 언제든지 연락주세요!

---

**여운 공연 설문 조사 시스템** - 음악으로 하나되는 순간을 위해 🎵
