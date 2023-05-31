"use client";
import axios from "axios";
import { FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState } from "react";
import { shuffle } from "lodash-es";
import { db } from "../schema";
import ModalContent from "./Modal";
import { Button } from "./Button";

const API_URL = "https://the-trivia-api.com/api/questions";

const registerWin = async (email: string) => {
  const res = await fetch("/api/win", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

const fetchQuestions= (setQuestions: (value: any[]) => void, setQuestionIndex?: (value: number) => void) => {
  axios.get(API_URL).then((response) => {
    setQuestions(response.data);
    setQuestionIndex?.(0);
  });
}

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState("");
  const [selectedButton, setSelectedButton] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timer, setTimer] = useState(15);


  // Fetch the questions from the API
  useEffect(() => {
    fetchQuestions(setQuestions)
  }, []);

  useEffect(() => {
    let countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          handleTimedOut();
          clearInterval(countdown);
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdown);
      setTimer(15);
    };
  }, [questionIndex, quizCompleted]);

  // Get a question and its correct answer
  const question = questions?.[questionIndex];
  const questionText = question?.question;
  const correctAnswer = questions?.length > 0 ? questions[questionIndex].correctAnswer : "";

  // handle the selection of an answer
  const handleSelectAnswer = (answer: string) => {
    setIsButtonDisabled(true);

    checkAnswer(answer);
    setSelectedButton(answer);
    setShowNextQuestionButton(true);
  };

  const fetchNextQuestion = () => {
    if (questionIndex === questions.length - 1 && !quizCompleted) {
      fetchQuestions(setQuestions, setQuestionIndex);
      setQuizCompleted(true);
    } else {
      setQuestionIndex(questionIndex + 1);
    }

    setIsButtonDisabled(false);
    setSelectedButton(null);
    setShowNextQuestionButton(false);
  };

  const handleTimedOut = () => {
    setIsButtonDisabled(true);
    setShowNextQuestionButton(true);
  }


  // Check if the answer is correct and register a win if it is
  const checkAnswer = (answer: string) => {
    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      registerWin(email);
      setQuizScore(quizScore + 1);
    }
  };

  const GenerateNextQuestion = ({ onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`rounded shadow border px-4 py-2 ${"bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white"}`}
      >
        Next Question
      </button>
    );
  };

  // Generate the question buttons using the useMemo hook to prevent re-rendering
  const questionButtons = useMemo(
    () =>
      question
        ? shuffle([
            question.correctAnswer,
            ...question.incorrectAnswers,
          ])
        : [],
    [question]
  );

  // Render the page
  return (
    <div className="flex flex-col items-center h-screen justify-center bg-slate-200">
      <div className="w-3/4">
        {!showNextQuestionButton && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
            <p className="text-orange-400 text-4x2 font-bold">{timer}</p>
          </div>
        )}
        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 mb-4">
          <h1 className="text-red-500 text-center text-3xl font-bold mb-4">
            Question {questionIndex + 1}
          </h1>
          <p className="text-center text-xl">{questionText}</p>
        </div>
        <div className="flex flex-row flex-wrap gap-4 justify-center">
          {questionButtons.map((answer: string, index: number) => (
            <Button
              key={index}
              onClick={() => handleSelectAnswer(answer)}
              clicked={selectedButton === answer}
              isCorrect={answer === correctAnswer}
              isDisabled={isButtonDisabled}
            >
              {answer}
            </Button>
          ))}
        </div>
        {showNextQuestionButton && (
          <div className="flex flex-row flex-wrap gap-4 justify-center mt-4">
            <GenerateNextQuestion onClick={() => fetchNextQuestion()} />
          </div>
        )}
      </div>
      {quizCompleted && (
        <ModalContent
          score={quizScore}
          questionLength={questions.length}
          setQuizCompleted={setQuizCompleted}
        />
      )}
    </div>
  );
}
