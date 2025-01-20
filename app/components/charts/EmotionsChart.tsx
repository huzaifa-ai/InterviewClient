'use client';

import { BarChart, Card, Title } from "@tremor/react";

interface EmotionsChartProps {
  data: {
    avgJoy: number;
    avgSadness: number;
    avgFear: number;
    avgDisgust: number;
    avgAnger: number;
    avgHappy: number;
    avgCalm: number;
    avgNone: number;
  };
}

export default function EmotionsChart({ data }: EmotionsChartProps) {
  const chartData = [
    {
      name: "Joy",
      value: data.avgJoy
    },
    {
      name: "Sadness",
      value: data.avgSadness
    },
    {
      name: "Fear",
      value: data.avgFear
    },
    {
      name: "Disgust",
      value: data.avgDisgust
    },
    {
      name: "Anger",
      value: data.avgAnger
    },
    {
      name: "Happy",
      value: data.avgHappy
    },
    {
      name: "Calm",
      value: data.avgCalm
    },
    {
      name: "None",
      value: data.avgNone
    }
  ];

  return (
    <Card>
      <Title>Average Emotions</Title>
      <BarChart
        className="mt-6"
        data={chartData}
        index="name"
        categories={["value"]}
        colors={["blue"]}
        valueFormatter={(value) => value.toFixed(2)}
      />
    </Card>
  );
}
