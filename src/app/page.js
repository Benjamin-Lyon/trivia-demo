"use client";
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "https://the-trivia-api.com/api/questions";

export default function Page() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setQuestions(response.data);
    });
  }, []);

  const getFirstQuestion = questions.length > 0 ? questions[0].question : "";
  const getCorrectAnswer = questions.length > 0 ? questions[0].correctAnswer : "";

  return (
    <div>
      <h2>First Question</h2>
        <p>{getFirstQuestion}</p>
      <h2>Correct Answer</h2>
        <p>{getCorrectAnswer}</p>
        <pre>{JSON.stringify(questions, null, 2)}</pre>
    </div>
  );
}
