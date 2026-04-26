import type { Meta, StoryObj } from "@storybook/nextjs";
import { FIXTURE_SCENARIO_LABEL, sampleMatchListItem } from "@peladas/fixtures";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: `Fixture: ${sampleMatchListItem.title}`,
  },
  parameters: {
    docs: {
      description: {
        component: FIXTURE_SCENARIO_LABEL,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: "outline" },
};
