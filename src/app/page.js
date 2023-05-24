"use client";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "https://the-trivia-api.com/api/questions";

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setQuestions(response.data);
    });
  }, []);

  const firstQuestion = questions.length > 0 ? questions[0].question : "";
  const getCorrectAnswer = questions.length > 0 ? questions[0].correctAnswer : "";
  const getIncorrectAnswers = questions.length > 0 ? questions[0].incorrectAnswers : [];

  const handleSelectQuestion = (answer) => {
    setSelectedQuestion(answer);

    const isCorrect = (answer === getCorrectAnswer);
    setIsAnswerCorrect(isCorrect);
  };

  return (
    <div>
      <h2>First Question</h2>
        <p>{firstQuestion}</p>
      <h2>Possible Answers</h2>
        <button onClick={() => handleSelectQuestion(getCorrectAnswer)}>{getCorrectAnswer}</button>
        {getIncorrectAnswers.map((answer, index) => (
          <button key={index} onClick={() => handleSelectQuestion(answer)} > {answer}</button>
        ))}
        {selectedQuestion && (
          <p> {isAnswerCorrect ? "Correct answer!" : `Incorrect answer! The correct answer was: ${getCorrectAnswer}`} </p>
        )}
        {/* <pre>{JSON.stringify(questions, null, 2)}</pre> */}
    </div>
  );
}
