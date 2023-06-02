import { Win } from "./Win";
import { action } from "@storybook/addon-actions";
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: "UI/Win",
  component: Win,
  tags: ["autodocs"],
  args: {
    onClick: action("onClick"),
  },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic = {
  args: {
    show: true,
  },
};

export const Hidden = {
  args: {
    show: false,
  },
};