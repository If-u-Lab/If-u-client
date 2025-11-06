// Centralized API service for all backend calls
// In a production app, this would call real API endpoints

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Simulate network delay
const SIMULATED_DELAY = 300

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const apiService = {
  // Questions API
  questions: {
    getTodayQuestion: async () => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: {
          id: "1",
          text: "인공지능이 인간의 일자리를 대체하는 것에 찬성하시나요?",
          category: "기술",
          options: ["찬성하는 입장", "반대하는 입장"],
          totalVotes: 147,
          votes: [87.2, 12.8],
          commentCount: 89,
          date: "25/10/04",
          isToday: true,
        },
      }
    },

    getQuestions: async (limit = 10) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: [
          {
            id: "1",
            text: "인공지능이 인간의 일자리를 대체하는 것에 찬성하시나요?",
            category: "기술",
            options: ["찬성하는 입장", "반대하는 입장"],
            totalVotes: 147,
            votes: [87.2, 12.8],
            commentCount: 89,
            date: "25/10/04",
            isToday: true,
          },
          {
            id: "2",
            text: "원격 근무가 미래의 표준이 되어야 한다고 생각하시나요?",
            category: "업무",
            options: ["찬성", "반대"],
            totalVotes: 542,
            votes: [65.3, 34.7],
            commentCount: 234,
            date: "25/10/03",
            isToday: false,
          },
        ],
      }
    },

    castVote: async (questionId: string, optionIndex: number) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: { questionId, optionIndex, timestamp: new Date().toISOString() },
      }
    },
  },

  // Comments API
  comments: {
    getComments: async (questionId: string) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: [
          {
            id: "1",
            author: "user01",
            date: "25/10/04 20:15",
            text: "AI 기술 발전은 필연적인 흐름이라고 생각해요.",
            likes: 23,
            replies: [],
            userLiked: false,
          },
        ],
      }
    },

    addComment: async (questionId: string, text: string) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: {
          id: `comment-${Date.now()}`,
          author: "currentUser",
          date: new Date().toLocaleString("ko-KR"),
          text,
          likes: 0,
          replies: [],
          userLiked: false,
        },
      }
    },

    toggleLike: async (commentId: string) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: { commentId, liked: true },
      }
    },
  },

  // User API
  user: {
    getUserProfile: async (userId: string) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: {
          id: userId,
          username: "순박한 퀴노아",
          bio: "하루하루 배우는 중입니다",
          votes: 47,
          comments: 123,
          participationRate: 89,
        },
      }
    },

    updateProfile: async (userId: string, updates: any) => {
      await delay(SIMULATED_DELAY)
      return {
        success: true,
        data: { id: userId, ...updates },
      }
    },
  },
}
