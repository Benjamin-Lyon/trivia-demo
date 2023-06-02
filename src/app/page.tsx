"use client";
import axios from "axios";
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { shuffle } from "lodash-es";
import { db } from "../schema";
import ModalContent from "./Modal";
import { Button } from "./Button";

const API_URL = "https://the-trivia-api.com/api/questions";

const registerWin = async (email: string, score: Number) => {
  const res = await fetch("/api/win", {
    method: "POST",
    body: JSON.stringify({ email, score }),
  });
  const body: {count: number} = await res.json();
  return body.count;
};

const fetchQuestions = () =>
  axios.get(API_URL).then((response) => {
    return response.data;
  });

const fetchCorrectAnswerCount = async (email: string) => {
  try {
    const res = await axios.get(`/api/win?email=${email}`);
    return res.data.count;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

type Question = {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
};

const TIMER_START = 5;

/**
 * Given an email address, this starts
 * a quiz session for that address.
 */
const useQuiz = (email: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<"loading" | "start" | "in_progress">(
    "loading"
  );
  const [questionIndex, setQuestionIndex] = useState(-1);

  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const [timer, setTimer] = useState(TIMER_START);
  const question: Question | undefined = questions[questionIndex];
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const wins = await fetchCorrectAnswerCount(email);
      setTotalScore(wins);
    })()
  }, [email])

  const correct = selectedAnswer === question?.correctAnswer;
  const timedOut = timer === 0;
  const answered = selectedAnswer !== null;

  console.log(selectedAnswer, answered);

  // Fetch the questions from the API
  useEffect(() => {
    (async () => {
      const questions = await fetchQuestions();
      setQuestions(questions);
      setStatus("start");
    })();
  }, []);

  // if there is a selected answer, you can pick a new Q
  const nextQuestion = answered || status === "start" || timedOut
    ? () => {
        setQuestionIndex((i) => i + 1);
        setSelectedAnswer(null);
        setStatus("in_progress");
      }
    : null;

  // Generate the question buttons using the useMemo hook to prevent re-rendering
  const answers = useMemo(
    () =>
      question
        ? shuffle([question.correctAnswer, ...question.incorrectAnswers])
        : [],
    [question]
  );

  const answerQuestion = question
    ? (answer: string) => {
        const correct = answer === question.correctAnswer;
        setSelectedAnswer(answer);

        if (correct) {
          setScore((s) => s + 1);
        }

        return correct;
      }
    : null;

  const nextQuiz = questionIndex > questions.length - 1 ? () => {
    (async () => {
      setStatus("loading");
      const questions = await fetchQuestions();
      setQuestions(questions);
      setQuestionIndex(-1);
      const newTotalScore = await registerWin(email, score);
      setTotalScore(newTotalScore);
      setScore(0);
      setStatus("start");
    })()
  } : null;

  // Question countdown timer
  useEffect(() => {
    if (status === "in_progress" && !answered) {
      let countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(countdown);
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdown);
        setTimer(TIMER_START);
      };
    }
  }, [questionIndex, status]);

  return {
    score,
    currentQuestion: status !== "loading" ? question?.question : null,
    answers,
    timeLeft: timer,
    answerQuestion,
    selectedAnswer: selectedAnswer,
    correctAnswer: (answered || timedOut ? question?.correctAnswer : null) as
      | string
      | null,
    status,
    nextQuestion,
    nextQuiz,
    questionNumber: questionIndex + 1,
    totalScore,
  };
};

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Page() {
  const [emailInner, setEmail] = useState("");
  const email = useDebounce(emailInner, 100);

  const {
    currentQuestion,
    answers,

    score,
    totalScore,
    status,
    questionNumber,
    timeLeft,

    correctAnswer,
    selectedAnswer,

    answerQuestion,
    nextQuestion,
    nextQuiz,
  } = useQuiz(email);

  const dummyFunction = () => {};

  // Render the page
  return (
    <div className="flex flex-col items-center h-screen justify-center bg-slate-200">
      <h1 className="text-red-500 text-center text-3xl font-bold mb-2">
        Welcome to the Trivia Quiz!
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Enter your email below to begin.
      </p>
      <div className="flex flex-row mb-16">
        <input
          type="email"
          value={emailInner}
          placeholder="Enter your email"
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:text-neutral-500"
          disabled={!["loading", "start"].includes(status)}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {status === "start" && email !== "" && nextQuestion ? (
        <div>
          <button
            onClick={nextQuestion}
            className="rounded shadow border px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white"
          >
            Start Quiz
          </button>
        </div>
      ) : null}
      {status === "in_progress" ? (
        <div className="w-2/4">
          {correctAnswer === null ? (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 mb-4">
              <p className="text-white text-4x2 font-bold">{timeLeft}</p>
            </div>
          ) : null}
          <div className="bg-white px-4 py-4 sm:px-6 mb-4">
            <h1 className="text-red-500 text-center text-3xl font-bold mb-2">
              Question {questionNumber}
            </h1>
            <p className="text-center text-xl">{currentQuestion}</p>
            <div className="flex flex-row flex-wrap gap-4 mt-2 justify-center">
              {answers.map((answer: string, index: number) => (
                <Button
                  key={index}
                  onClick={() => answerQuestion(answer)}
                  clicked={selectedAnswer === answer}
                  isCorrect={correctAnswer === answer}
                  isDisabled={correctAnswer !== null}
                >
                  {answer}
                </Button>
              ))}
            </div>
          </div>
          {correctAnswer !== null ? (
            <div className="flex flex-row flex-wrap gap-4 justify-center mt-4 mb-4">
              <NextQuestionButton onClick={nextQuestion} />
            </div>
          ) : null}
        </div>
      ) : null}
      <ModalContent
        open={nextQuiz !== null}
        nextQuiz={nextQuiz ?? dummyFunction}
        score={score}
        questionLength={10}
        correctAnswersCount={totalScore + score}
      />
    </div>
  );
}

const NextQuestionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded shadow border px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white"
    >
      Next Question
    </button>
  );
};
