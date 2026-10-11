import type { DailyQuizLocation, QuizConfig, QuizQuestion } from "@/types/referrals";

export const DAILY_QUIZ_LOCATIONS: { id: string; label: string; state: string }[] = [
  { id: "mumbai", label: "Mumbai", state: "Maharashtra" },
  { id: "pune", label: "Pune", state: "Maharashtra" },
  { id: "thane", label: "Thane", state: "Maharashtra" },
  { id: "navi-mumbai", label: "Navi Mumbai", state: "Maharashtra" },
  { id: "delhi", label: "Delhi", state: "Delhi" },
  { id: "lucknow", label: "Lucknow", state: "Uttar Pradesh" },
  { id: "ahmedabad", label: "Ahmedabad", state: "Gujarat" },
  { id: "jaipur", label: "Jaipur", state: "Rajasthan" },
  { id: "patna", label: "Patna", state: "Bihar" },
  { id: "kolkata", label: "Kolkata", state: "West Bengal" },
];

function question(id: string, text: string, options: string[], correctIndex: number): QuizQuestion {
  return { id, text, options, correctIndex, timerSeconds: 30, points: 100 };
}

function emptyQuiz(quizNumber: 1 | 2): QuizConfig {
  return {
    quizNumber,
    isActive: false,
    scheduleDate: "",
    startTime: "",
    endTime: "",
    totalQuestions: 0,
    pointsPerCorrect: 100,
    questions: [],
  };
}

function sampleQuiz(quizNumber: 1 | 2, locationLabel: string): QuizConfig {
  const questions = [
    question(`q-${locationLabel}-${quizNumber}-1`, "What is the capital of India?", ["Mumbai", "New Delhi", "Kolkata", "Chennai"], 1),
    question(`q-${locationLabel}-${quizNumber}-2`, "Which river is the longest in India?", ["Yamuna", "Godavari", "Ganga", "Krishna"], 2),
    question(`q-${locationLabel}-${quizNumber}-3`, "How many states does India have?", ["26", "28", "29", "30"], 1),
    question(`q-${locationLabel}-${quizNumber}-4`, "Which festival is known as the festival of lights?", ["Holi", "Diwali", "Eid", "Baisakhi"], 1),
    question(`q-${locationLabel}-${quizNumber}-5`, "What is the national animal of India?", ["Lion", "Elephant", "Tiger", "Peacock"], 2),
  ];
  return {
    quizNumber,
    isActive: true,
    scheduleDate: "28 Sep 2026",
    startTime: quizNumber === 1 ? "10:00 AM" : "06:00 PM",
    endTime: quizNumber === 1 ? "11:00 AM" : "07:00 PM",
    totalQuestions: questions.length,
    pointsPerCorrect: 100,
    questions,
  };
}

const ACTIVE_IDS = new Set(["mumbai", "pune", "thane", "navi-mumbai", "delhi"]);

export const dailyQuizLocations: DailyQuizLocation[] = DAILY_QUIZ_LOCATIONS.map((loc) => {
  const active = ACTIVE_IDS.has(loc.id);
  return {
    locationId: loc.id,
    locationLabel: loc.label,
    state: loc.state,
    isActive: active,
    quiz1: active ? sampleQuiz(1, loc.label) : emptyQuiz(1),
    quiz2: active ? sampleQuiz(2, loc.label) : emptyQuiz(2),
    todaysGift: active
      ? { giftName: "Amazon Gift Voucher ₹500", photo: "amazon-voucher.jpg", description: "Redeemable on amazon.in" }
      : { giftName: "", photo: undefined, description: "" },
  };
});
