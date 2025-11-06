/**
 * 로딩 스켈레톤 컴포넌트
 * 
 * API 요청 중 데이터를 불러오는 동안 표시할 로딩 화면입니다.
 * 실제 QuestionCard 구조와 동일한 레이아웃으로 자연스러운 로딩 경험을 제공합니다.
 * 
 * 사용법: API 연결 후 각 페이지 컴포넌트(HomePage, QuestionPage에서 주석 해제하여 사용
 */

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4 md:p-6 pb-32">
      {/* Page title skeleton */}
      <div className="h-9 md:h-10 bg-muted-foreground/10 rounded w-1/3 animate-pulse"></div>

      {/* Question card skeletons */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full bg-white rounded-lg border border-border p-4 md:p-6 space-y-4">
            {/* Question title skeleton - 3 lines */}
            <div className="space-y-2 animate-pulse">
              <div className="h-5 md:h-6 bg-muted-foreground/10 rounded w-full"></div>
              <div className="h-5 md:h-6 bg-muted-foreground/10 rounded w-5/6"></div>
              <div className="h-5 md:h-6 bg-muted-foreground/10 rounded w-4/6"></div>
            </div>

            {/* Option buttons skeleton */}
            <div className="space-y-2 md:space-y-3 animate-pulse">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="w-full p-3 md:p-4 rounded-lg border-2 border-border bg-muted/30"
                >
                  <div className="h-5 md:h-6 bg-muted-foreground/10 rounded w-2/3"></div>
                </div>
              ))}
            </div>

            {/* Vote count skeleton */}
            <div className="animate-pulse">
              <div className="h-4 bg-muted-foreground/10 rounded w-32 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}