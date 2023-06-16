import React, { FC, ReactNode } from "react";

type ButtonProps = {
  onClick: () => void;
  clicked: boolean;
  isCorrect: boolean;
  isDisabled: boolean;
  children?: ReactNode;
};

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  clicked,
  isCorrect,
  isDisabled,
}) => (
  <button
    onClick={onClick}
    className={`rounded shadow border px-4 py-2 ${
      clicked
        ? isCorrect
          ? "bg-green-500 text-white hover:bg-green-400"
          : "bg-red-500 text-white hover:bg-red-400"
        : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
    } ${isCorrect ? "disabled:bg-green-500 disabled:hover:bg-green-400 disabled:text-white" : ""}`}
    disabled={isDisabled}
  >
    {children}
  </button>
);
