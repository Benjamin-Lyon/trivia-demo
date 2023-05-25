"use client";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { shuffle } from "lodash-es";
import {db} from "../schema";

const API_URL = "https://the-trivia-api.com/api/questions";

const registerWin = async (email: string) => {
  const res = await fetch("/api/win", {method: "POST", body: JSON.stringify({email})});
}

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setQuestions(response.data);
    });
  }, []);

  const firstQuestion = questions?.[0];
  const questionText = firstQuestion?.question;
  const correctAnswer = questions.length > 0 ? questions[0].correctAnswer : "";

  const handleSelectQuestion = (answer) => {
    setSelectedQuestion(answer);

    const isCorrect = answer === correctAnswer;
    setIsAnswerCorrect(isCorrect);

    setSelectedButton(answer);

    if (isCorrect) {
      registerWin(email)
    }
  };

  const questionButtons = useMemo(
    () =>
      firstQuestion
        ? shuffle([
            firstQuestion.correctAnswer,
            ...firstQuestion.incorrectAnswers,
          ])
        : [],
    [firstQuestion]
  );

  return (
    <div className="flex">
      <div className="w-[800px] mx-auto">
        <input value={email} type="email" className="m-4 border rounded bg-neutral-50" placeholder="Email" onChange={(e) => {console.log(e); setEmail(e.target.value)}} />
        <h1 className="text-red-500 text-2xl font-bold text-center">
          Question
        </h1>
        <p className="text-center">{questionText}</p>
        <div className="flex flex-row flex-wrap gap-4 justify-center">
          {questionButtons.map((answer, index) => (
            <Button
              key={index}
              onClick={() => handleSelectQuestion(answer)}
              clicked={selectedButton === answer}
              isCorrect={answer === correctAnswer}
              >
                {answer}
            </Button>
          ))}
        </div>
        {/* <pre>{JSON.stringify(questions, null, 2)}</pre> */}
      </div>
    </div>
  );
}

export const Button = ({ children, onClick, clicked, isCorrect }) => (
  <button
    onClick={onClick}
    className={`rounded shadow border px-4 py-2 hover:bg-neutral-200 ${
      clicked
        ? isCorrect
          ? "bg-green-400 text-white"
          : "bg-red-400 text-white"
        : "bg-neutral-100 text-neutral-800"
    }`}
  >
    {children}
  </button>
);
