'use client';

import { DonutChart, Card, Title } from "@tremor/react";

interface SentimentChartProps {
  data: Array<{
    _id: string;
    count: number;
  }>;
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const chartData = data.map(item => ({
    name: item._id,
    value: item.count
  }));

  return (
    <Card>
      <Title>Sentiment Distribution</Title>
      <DonutChart
        className="mt-6"
        data={chartData}
        category="value"
        index="name"
        colors={["emerald", "yellow", "rose"]}
      />
    </Card>
  );
}
