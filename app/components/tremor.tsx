type CustomTooltipProps = {
  tooltip: {
    base: string;
  };
  title: string;
  text: string;
};

export const customTooltip: CustomTooltipProps = {
  tooltip: {
    base: "rounded-tremor-default border border-tremor-border bg-tremor-background p-2 shadow-tremor-dropdown text-tremor-content-emphasis dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:shadow-dark-tremor-dropdown",
  },
  title: "text-sm font-medium text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis",
  text: "text-xs font-medium text-tremor-content dark:text-dark-tremor-content",
};