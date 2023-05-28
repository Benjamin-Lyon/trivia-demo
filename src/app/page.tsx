"use client";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { shuffle } from "lodash-es";
import { db } from "../schema";

const API_URL = "https://the-trivia-api.com/api/questions";

const registerWin = async (email: string) => {
  const res = await fetch("/api/win", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState("");
  const [selectedButton, setSelectedButton] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);

  // Fetch the questions from the API
  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setQuestions(response.data);
    });
  }, []);

  // Get the first question and its correct answer
  const question = questions?.[questionIndex];
  const questionText = question?.question;
  const correctAnswer = questions.length > 0 ? questions[0].correctAnswer : "";

  // handle the selection of an answer
  const handleSelectAnswer = (answer: string) => {
    setIsButtonDisabled(true);

    checkAnswer(answer);
    setSelectedButton(answer);
    setShowNextQuestionButton(true);
  };

  const fetchNextQuestion = () => {
    setQuestionIndex(questionIndex + 1);
    setIsButtonDisabled(false);
    setSelectedButton(null);
    setShowNextQuestionButton(false);
  };

  // Check if the answer is correct and register a win if it is
  const checkAnswer = (answer: string) => {
    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      registerWin(email);
    }
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
    <div className="flex flex-col items-center h-screen justify-center">
      <div className="w-3/4">
        <h1 className="text-red-500 text-center text-3xl font-bold mb-4">
          Question
        </h1>
        <p className="text-center text-xl mb-4">{questionText}</p>
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
    </div>
  );
}

export const Button = ({ children, onClick, clicked, isCorrect, isDisabled }) => (
  <button
    onClick={onClick}
    className={`rounded shadow border px-4 py-2 ${
      // hover:bg-neutral-200 commented out until hover for answers is implemented
      clicked
        ? isCorrect
          ? "bg-green-400 text-white"
          : "bg-red-400 text-white"
        : "bg-neutral-100 text-neutral-800"
    }`}
    disabled={isDisabled}
  >
    {children}
  </button>
);

const GenerateNextQuestion = ({ onClick}) => {
  return <button
    onClick={onClick}
    className={`rounded shadow border px-4 py-2 ${
      "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
    }`}
  >
    Next Question
  </button>
}
