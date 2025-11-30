# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 작업할 때 참고하는 가이드입니다.

## 중요: 실수 방지 지침 (CRITICAL)

**다음 규칙을 반드시 준수하여 이전 실수를 반복하지 마세요:**

### 1. Next.js 버전별 Breaking Changes 확인 필수
- **현재 버전**: Next.js 16.0.0 (2025년 최신)
- **동적 라우트 params**: Next.js 15+에서 `params`는 **Promise**입니다
  ```typescript
  // 잘못된 코드 (Next.js 13-14 방식)
  export default function Page({ params }: { params: { id: string } }) {
    const question = getQuestion(params.id)  // ERROR!
  }

  // 올바른 코드 (Next.js 15+ 방식)
  import { use } from "react"
  export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)  // Promise unwrap 필수
    const question = getQuestion(id)
  }
  ```

### 2. TypeScript 타입 에러 절대 무시 금지
- 타입 에러는 런타임 버그의 신호입니다
- `ignoreBuildErrors: true`는 개발 편의용이며, 프로덕션 전 제거해야 합니다
- 타입이 맞지 않으면 **반드시 공식 문서 확인**

### 3. 코드 작성 전 공식 문서 참조
- 새로운 기능 구현 시: https://nextjs.org/docs
- 특히 App Router, 동적 라우트, Server/Client Components
- 버전별 마이그레이션 가이드 확인: https://nextjs.org/docs/app/building-your-application/upgrading

### 4. 모바일 우선 설계 원칙
- **이 프로젝트는 모바일 웹앱입니다**
- hover 효과 사용 금지 (터치 디바이스에서 작동 안 함)
- 대신 시각적 상태 구분 사용 (색상, 테두리, 그림자 등)

### 5. 변경 전 영향 범위 확인
- 전역 상태 변경 시: Context Provider 위치 확인
- 라우팅 구조 변경 시: 모든 navigation 로직 업데이트
- 컴포넌트 props 변경 시: 모든 사용처 확인

### 6. YAGNI 원칙 (You Aren't Gonna Need It)
- 사용자가 요청하지 않은 기능을 임의로 추가하지 마세요
- "나중에 필요할 것 같다"는 추측으로 복잡도를 높이지 마세요
- 단, 확정된 요구사항 구현에 필요한 합리적인 코드는 적절히 포함 가능
- 예시: 배지 시스템처럼 요청되지 않은 기능 추가 금지, API 연동에 필요한 isLoading은 허용

---

## 개발 명령어

```bash
# 개발 서버 시작 (기본: http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 린터 실행
npm run lint
```

---

## 프로젝트 개요

**if-U-CLIENT**는 매일 다양한(랜덤) 카테고리 중 하나의 질문이 주어지고, 이에 대한 투표 및 토론 플랫폼입니다. 사용자는 매일 제시되는 질문에 투표하고, 결과를 확인하며, 댓글로 의견을 나눌 수 있습니다.

### 기술 스택
- **프레임워크**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **스타일링**: Tailwind CSS 4.1.9
- **UI 컴포넌트**: shadcn/ui (Radix UI 프리미티브 기반)
- **폼 관리**: React Hook Form 8.0.1 + Zod 3.24.1 유효성 검사
- **차트**: Recharts 2.15.0
- **아이콘**: lucide-react 0.469.0
- **언어**: TypeScript 5.7.3, 전체 한국어 UI

### MVP 제약사항
- **인증**: 실제 JWT/세션 없음, localStorage 기반 온보딩만 구현
- **데이터**: 모든 데이터는 메모리 내 mock (API 통합 필요)
- **영속성**: 페이지 새로고침 시 투표/댓글 상태 초기화됨s

---

## 라우팅 구조

Next.js App Router의 파일 시스템 라우팅을 사용합니다. Route Group `(main)`을 사용하여 하단 네비게이션 레이아웃을 공유하면서도 URL에는 영향을 주지 않습니다.

### 디렉토리 구조

```
app/
├── page.tsx                          # 온보딩/로그인 (/)
├── layout.tsx                        # 루트 레이아웃
├── globals.css                       # 전역 스타일 + Tailwind 설정
└── (main)/                           # Route Group: 하단 네비게이션 공유
    ├── layout.tsx                    # 공유 레이아웃 + 하단 네비게이션
    ├── home/
    │   └── page.tsx                  # 홈 페이지 (/home)
    ├── questions/
    │   ├── page.tsx                  # 질문 목록 (/questions)
    │   └── [id]/
    │       └── page.tsx              # 질문 상세 (/questions/[id])
    └── profile/
        └── page.tsx                  # 프로필 (/profile)
```

**Route Group 설명**: `(main)` 폴더는 URL 경로에 포함되지 않지만, 내부의 모든 페이지가 동일한 `layout.tsx`를 공유하도록 합니다. 이를 통해 `/home`, `/questions`, `/profile` 모두에서 하단 네비게이션이 표시됩니다.

### URL 매핑

| 경로 | 설명 | 파일 |
|------|------|------|
| `/` | 온보딩/로그인 | [app/page.tsx](app/page.tsx) |
| `/home` | 홈 (오늘의 질문 + 트렌드) | [app/(main)/home/page.tsx](app/(main)/home/page.tsx) |
| `/questions` | 과거 질문 목록 | [app/(main)/questions/page.tsx](app/(main)/questions/page.tsx) |
| `/questions/[id]` | 질문 상세 + 댓글 | [app/(main)/questions/[id]/page.tsx](app/(main)/questions/[id]/page.tsx) |
| `/profile` | 사용자 프로필 | [app/(main)/profile/page.tsx](app/(main)/profile/page.tsx) |

### 네비게이션 패턴

App Router는 `useRouter()` 훅과 `Link` 컴포넌트를 사용하여 클라이언트 사이드 네비게이션을 제공합니다. 이를 통해 브라우저 히스토리가 자동으로 관리되며, 뒤로가기 시 정확한 이전 페이지로 복귀하고 스크롤 위치도 자동으로 복원됩니다.

```typescript
import { useRouter } from "next/navigation"

const router = useRouter()
router.push('/questions/123')  // 페이지 이동
router.back()                  // 이전 페이지로 (자동 스크롤 복원)
```

하단 네비게이션 바는 [app/(main)/layout.tsx](app/(main)/layout.tsx)에 중앙 집중식으로 구현되어 있으며, `Link` 컴포넌트와 `usePathname()`으로 현재 활성 탭을 감지합니다. Route Group 패턴 덕분에 모든 메인 페이지에서 동일한 네비게이션이 자동으로 표시됩니다.

---

## 전역 상태 관리

### Context API 기반 아키텍처

전역 상태는 React Context API를 사용하여 관리됩니다. 이전에는 props drilling 방식으로 상태를 전달했으나, 현재는 Context Provider로 전환되어 어느 컴포넌트에서든 필요한 상태에 접근할 수 있습니다.

**QuestionsContext** ([contexts/questions-context.tsx](contexts/questions-context.tsx)):
```typescript
export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const questionsState = useQuestions()
  return (
    <QuestionsContext.Provider value={questionsState}>
      {children}
    </QuestionsContext.Provider>
  )
}

export function useQuestionsContext() {
  const context = useContext(QuestionsContext)
  if (!context) {
    throw new Error("useQuestionsContext must be used within QuestionsProvider")
  }
  return context
}
```

루트 레이아웃에서 Provider로 앱 전체를 감싸서 모든 페이지에서 접근 가능하도록 설정되어 있습니다.

```typescript
// 사용 예시
const { castVote, hasUserVoted, getUserVote } = useQuestionsContext()
```

---

## 커스텀 훅

[hooks/](hooks/) 디렉토리의 커스텀 훅들이 비즈니스 로직을 캡슐화합니다.

### useQuestions ([use-questions.ts](hooks/use-questions.ts))
질문 데이터 및 투표 로직을 관리합니다.

**주요 기능:**
- 오늘의 질문 조회 (`getTodayQuestion`)
- 과거 질문 목록 (`getPastQuestions`)
- 투표 처리 (`castVote`) - 낙관적 업데이트 패턴
- 투표 여부 확인 (`hasUserVoted`)
- 사용자 투표 조회 (`getUserVote`)

**낙관적 업데이트 패턴:**
```typescript
const castVote = (questionId: string, optionIndex: number) => {
  setLoadingId(questionId)

  // 1. 즉시 사용자 투표 상태 업데이트
  setUserVotes(prev => new Map(prev).set(questionId, optionIndex))

  // 2. API 지연 시뮬레이션 (300ms)
  setTimeout(() => {
    // 3. 투표 퍼센티지 재계산 및 UI 업데이트
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const updatedVotes = [...q.votes]
        updatedVotes[optionIndex]++
        return { ...q, votes: updatedVotes, totalVotes: q.totalVotes + 1 }
      }
      return q
    }))
    setLoadingId(null)
  }, 300)
}
```

투표 상태는 `Map<questionId, optionIndex>` 형태로 저장되며, 페이지 새로고침 시 초기화됩니다 (실제 API 연동 필요).

### useComments ([use-comments.ts](hooks/use-comments.ts))
댓글 및 대댓글 작성, 좋아요 기능을 관리합니다.

**주요 기능:**
- 댓글 조회 (`getComments`)
- 댓글 추가 (`addComment`)
- 대댓글 추가 (`addReply`)
- 좋아요 토글 (`toggleLike`)

댓글은 중첩 구조를 지원하며, 각 댓글은 `replies: Comment[]` 배열을 가질 수 있습니다.

### useUserProfile ([use-user-profile.ts](hooks/use-user-profile.ts))
사용자 프로필 정보와 활동 통계를 관리합니다.

**주요 기능:**
- 프로필 조회 (`profile`)
- 자기소개 수정 (`updateBio`, `editMode`, `setEditMode`)
- 가입 일수 계산 (`getDaysSinceJoin`)
- 일일 평균 활동 계산 (`getAverageDaily`)

**프로필 데이터 구조:**
```typescript
interface UserProfile {
  id: string
  username: string
  bio?: string
  totalVotes: number
  totalComments: number
  engagementRate: number
  joinDate: string
  recentActivity: ActivityItem[]  // 최근 7일
  bestComments: Comment[]         // 베스트 댓글
}
```

### useOnboarding ([use-onboarding.ts](hooks/use-onboarding.ts))
온보딩 플로우와 사용자 설정을 관리합니다.

**온보딩 단계:**
1. `loading` - 로딩 스플래시
2. `initial` - 시작하기 화면
3. `slides` - 3개 소개 슬라이드
4. `preferences` - 알림 설정
5. `complete` - 완료 후 `/home`으로 리다이렉트

localStorage에 `onboarding_completed: "true"` 저장하여 재방문 시 바로 홈으로 이동합니다.

---

## 컴포넌트 구조

```
components/
├── ui/                           # shadcn/ui 기본 컴포넌트 (최소한으로 유지)
│   ├── button.tsx
│   └── switch.tsx
├── activity-chart.tsx            # 프로필 활동 차트
├── client-providers.tsx          # Context Provider 래퍼
├── comment-item.tsx              # 개별 댓글 컴포넌트
├── comment-section.tsx           # 댓글 섹션
├── loading-skeleton.tsx          # 로딩 스켈레톤
├── onboarding-carousel.tsx       # 온보딩 슬라이드
├── onboarding-preferences.tsx    # 온보딩 설정
├── question-card.tsx             # 질문 카드
└── voting-results.tsx            # 투표 결과 차트
```

**설계 원칙**: YAGNI (You Aren't Gonna Need It) 원칙에 따라 사용하지 않는 shadcn/ui 컴포넌트는 설치하지 않았습니다. 필요 시에만 `npx shadcn@latest add [component]`로 추가하세요.

### 주요 컴포넌트

**QuestionCard** ([question-card.tsx](components/question-card.tsx)):
- 질문 텍스트 및 옵션 버튼 표시
- 투표 전: 버튼 형태의 옵션
- 투표 후: 퍼센티지 막대와 함께 결과 표시
- 낙관적 업데이트 지원 (로딩 상태 표시)

**CommentSection** ([comment-section.tsx](components/comment-section.tsx)):
- 중첩 댓글 스레드 렌더링
- 댓글/대댓글 작성 폼
- 좋아요, 답글 달기 기능
- 재귀적 컴포넌트 구조 (`CommentItem`)

**VotingResults** ([voting-results.tsx](components/voting-results.tsx)):
- Recharts BarChart 사용
- 투표 결과 시각화 (퍼센티지 막대)
- 반응형 디자인 (모바일/데스크톱)

**ActivityChart** ([activity-chart.tsx](components/activity-chart.tsx)):
- 최근 7일 활동 시각화
- 세로 막대 형태의 커스텀 차트
- 프로필 페이지에서 사용

**ClientProviders** ([client-providers.tsx](components/client-providers.tsx)):
- QuestionsProvider를 래핑하는 클라이언트 컴포넌트
- 루트 레이아웃에서 metadata를 유지하기 위해 분리됨

**BottomNav** ([app/(main)/layout.tsx](app/(main)/layout.tsx)):
- 하단 고정 네비게이션 바
- 3개 탭: 질문, 홈, 마이페이지
- `usePathname()`으로 활성 탭 표시
- Route Group `(main)` 레이아웃에 중앙 집중식으로 구현

### 새로운 페이지 추가 시

메인 앱 페이지를 추가하려면 `app/(main)/` 디렉토리 내부에 생성하세요. 이렇게 하면 하단 네비게이션이 자동으로 표시됩니다. 네비게이션이 필요 없는 페이지는 `app/` 루트에 직접 생성하세요.

---

## 모바일 웹앱 최적화

### 모바일 우선 설계

이 앱은 **모바일 디바이스를 주 타겟**으로 합니다. 모든 UI 결정은 터치 인터랙션을 기준으로 이루어져야 합니다.

### Hover 효과 사용 금지

터치 디바이스에서는 hover 상태가 의미 없으므로, **시각적 상태 구분**으로 대체합니다.

**잘못된 패턴:**
```tsx
<div className="hover:opacity-80 hover:bg-muted">
  클릭 가능한 카드
</div>
```

**올바른 패턴:**
```tsx
{/* 투표 완료 = 클릭 가능, 시각적으로 명확하게 구분 */}
<div className={
  hasVoted
    ? "bg-card border-2 border-primary/40 shadow-sm"  // 활성 상태
    : "bg-muted/30 border border-border/50"           // 비활성 상태
}>
  {!hasVoted && <span className="ml-auto text-xs">투표 후 확인 가능</span>}
</div>
```

### 반응형 디자인 (Mobile First)

Tailwind CSS의 모바일 우선 방식을 사용합니다.

- **기본 스타일**: 모바일 (< 768px)
- **`md:` 접두사**: 태블릿/데스크톱 (>= 768px)

```tsx
<div className="p-4 md:p-6 text-sm md:text-base">
  {/* 모바일: padding 16px, 텍스트 14px */}
  {/* 데스크톱: padding 24px, 텍스트 16px */}
</div>
```

### 하단 네비게이션 여백

고정된 하단 네비게이션 바가 콘텐츠를 가리지 않도록 이중 패딩 전략을 사용합니다:

1. **레이아웃 레벨** ([app/(main)/layout.tsx](app/(main)/layout.tsx)):
   ```tsx
   <main className="pb-20 md:pb-24">{children}</main>
   ```
   - 모바일: 80px, 데스크톱: 96px
   - 네비게이션 바 높이(h-16 md:h-20) + 추가 여백

2. **페이지 레벨** (모든 메인 페이지):
   ```tsx
   <div className="w-full max-w-2xl mx-auto space-y-6 px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-20">
     {/* 페이지 콘텐츠 */}
   </div>
   ```
   - 수평 패딩: `px-6 md:px-8` (24px → 32px)
   - 상단 패딩: `pt-8 md:pt-10` (32px → 40px)
   - 하단 패딩: `pb-12 md:pb-20` (48px → 80px)

**적용 위치:**
- [app/(main)/home/page.tsx](app/(main)/home/page.tsx)
- [app/(main)/questions/page.tsx](app/(main)/questions/page.tsx)
- [app/(main)/questions/[id]/page.tsx](app/(main)/questions/[id]/page.tsx)
- [app/(main)/profile/page.tsx](app/(main)/profile/page.tsx)

모든 메인 페이지에 동일한 패턴이 적용되어 일관된 여백과 가독성을 유지합니다.

---

## 데이터 플로우

### 질문 투표 플로우

```
사용자가 옵션 클릭
  → QuestionCard.onVote()
    → useQuestionsContext().castVote(questionId, optionIndex)
      → setUserVotes (즉시 UI 반영 - 낙관적 업데이트)
        → setTimeout 300ms (API 지연 시뮬레이션)
          → 투표 퍼센티지 재계산
            → setQuestions (투표 카운트 증가)
              → UI 리렌더링 (결과 표시)
```

### 페이지 네비게이션 플로우

```
사용자가 카드 클릭
  → router.push('/questions/123')
    → Next.js App Router
      → URL 변경 + 브라우저 히스토리 추가
        → app/questions/[id]/page.tsx 렌더링
          → useQuestionsContext().getQuestionById(id)
            → 질문 데이터 조회 및 표시

뒤로가기 버튼 클릭
  → router.back()
    → 브라우저 히스토리 pop
      → 이전 URL로 복귀
        → 이전 페이지 렌더링
          → 스크롤 위치 자동 복원
```

### 댓글 작성 플로우

```
사용자가 댓글 입력 후 제출
  → CommentSection.handleSubmit()
    → useComments().addComment(questionId, text, author)
      → 새 댓글 객체 생성 (ID, 타임스탬프 포함)
        → setComments (상태 업데이트)
          → UI 리렌더링 (새 댓글 표시)
```

---

## 설정 및 구성

### 경로 별칭

[tsconfig.json](tsconfig.json):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**사용 예시:**
```typescript
import { Button } from "@/components/ui/button"
import { useQuestions } from "@/hooks/use-questions"
import { QuestionsProvider } from "@/contexts/questions-context"
```

### Next.js 설정

[next.config.mjs](next.config.mjs):
```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true  // 프로덕션 배포 전 false로 변경 필요
  },
  images: {
    unoptimized: true
  }
}
```

**주의사항:**
- `ignoreBuildErrors: true`는 개발 편의를 위한 설정입니다
- 프로덕션 배포 전 반드시 모든 타입 에러를 수정하고 `false`로 변경해야 합니다

### Tailwind CSS 커스터마이징

[app/globals.css](app/globals.css):
- OKLch 색상 공간 기반 CSS 변수
- 라이트/다크 모드 색상 팔레트
- Tailwind 4.1 문법 사용
- shadcn/ui 테마 시스템 통합

**주요 CSS 변수:**
```css
:root {
  --primary: oklch(0.55 0.25 265);
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0 0);
  /* ... */
}
```

---

## Next.js 15/16 특수 사항

### params는 Promise

Next.js 15부터 동적 라우트의 `params`는 Promise 타입입니다. 반드시 `React.use()`로 unwrap해야 합니다.

**올바른 사용법:**
```typescript
import { use } from "react"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)  // Promise unwrap
  const question = getQuestionById(id)
  // ...
}
```

**잘못된 사용법 (타입 에러):**
```typescript
export default function Page({ params }: { params: { id: string } }) {
  const question = getQuestionById(params.id)  // ERROR!
}
```

### searchParams도 Promise

```typescript
export default function Page({
  searchParams
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = use(searchParams)
  // ...
}
```

---

## 프로덕션 배포 체크리스트

### 1. TypeScript 오류 수정
- [next.config.mjs](next.config.mjs)에서 `ignoreBuildErrors: false`로 변경
- `npm run build` 실행하여 모든 타입 에러 해결

### 2. 인증 시스템 구현
- localStorage 기반 온보딩을 실제 JWT/세션 인증으로 교체
- API 토큰 관리 및 갱신 로직 추가
- 보호된 라우트 미들웨어 구현

### 3. API 통합
- [lib/api-service.ts](lib/api-service.ts)의 mock 함수를 실제 API 엔드포인트로 교체
- 에러 핸들링 및 재시도 로직 추가
- 로딩 상태 관리 개선

### 4. 데이터 영속성 구현
- 투표 상태를 서버에 저장 (현재는 페이지 새로고침 시 초기화됨)
- 댓글 데이터 저장
- 사용자 프로필 변경사항 저장

### 5. 이미지 최적화
- [next.config.mjs](next.config.mjs)에서 `unoptimized: false`로 변경
- Next.js Image 컴포넌트 사용하여 자동 최적화 활성화

### 6. 성능 최적화
- 큰 컴포넌트에 동적 임포트 적용 (`next/dynamic`)
- Server Components 적용 고려 (현재는 대부분 Client Components)
- 번들 크기 분석 및 최적화

### 7. 에러 모니터링 및 로깅
- **에러 추적 서비스 도입**: Sentry, LogRocket, Datadog 등
- **로깅 정책**:
  - 개발 환경: `console.log`, `console.error` 모두 허용
  - 프로덕션 환경: `console.error`만 유지 (에러 추적용)
  - 민감 정보(토큰, 개인정보 등)는 절대 로깅 금지
- **프로덕션 빌드 최적화** (선택사항):
  - Webpack 플러그인으로 `console.log` 자동 제거
  - 환경별 로깅 레벨 분리

**현재 상태**: 개발 단계로 `console.log`, `console.error` 모두 허용 중

### 8. 보안 강화
- 사용자 입력 sanitization (XSS 방지)
- CSRF 토큰 구현
- Rate limiting 적용
- 환경 변수로 민감 정보 관리 ✅ (Firebase Config, VAPID Key 완료)

### 9. 환경 변수 설정
`.env.local` 파일이 이미 생성되어 있습니다. API 서버 구현 시 `NEXT_PUBLIC_API_URL` 업데이트 필요:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_AUTH_DOMAIN=auth.example.com
API_SECRET_KEY=your-secret-key
```

---

## 제약사항 및 패턴

### 현재 구현 상태
- **대부분 클라이언트 컴포넌트**: `"use client"` 지시어 사용
- **한국어 UI**: 하드코딩 (i18n 필요 시 라이브러리 추가 필요)
- **300ms 시뮬레이션 지연**: 실제 API 호출로 교체 시 `setTimeout` 제거
- **Context API 전역 상태**: QuestionsProvider로 앱 전체 감싸기
- **localStorage 기반 온보딩**: 페이지 새로고침 후에도 상태 유지

### 코딩 컨벤션
- 파일명: kebab-case (question-card.tsx)
- 컴포넌트명: PascalCase (QuestionCard)
- 함수명: camelCase (castVote, getUserVote)
- 타입/인터페이스명: PascalCase (UserProfile, Question)

---