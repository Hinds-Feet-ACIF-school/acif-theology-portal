import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { HelpCircle } from "lucide-react";
import { DashboardStat } from "../../../types/admin";
import { IconMap } from "../../../utils/adminUtils";
import * as AdminStyles from "../../../styles/adminStyles";
import { DataDisplayWrapper } from "../common/DataDisplayWrapper";

interface DashboardStatsGridProps {
  stats: DashboardStat[];
  isLoading: boolean;
  error: string | null;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats, isLoading, error }) => {
  return (
    <DataDisplayWrapper isLoading={isLoading} error={error} count={stats.length} loadingText="Loading statistics...">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = IconMap[stat.iconName] || HelpCircle;
          return (
            <Card key={stat.id} className={`${AdminStyles.cardBgLight} ${AdminStyles.cardBgDark} ${AdminStyles.cardBorder} shadow-sm`}>
              <CardHeader>
                <CardTitle className={`text-sm font-medium ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`}>{stat.title}</CardTitle>
                <div className={`rounded-full p-2 inline-block bg-gray-100 dark:bg-gray-700`}>
                  <IconComponent className={`h-5 w-5 ${AdminStyles.secondaryTextLight} ${AdminStyles.secondaryTextDark}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${AdminStyles.primaryTextLight} ${AdminStyles.primaryTextDark}`}>{stat.value}</div>
                <p className={`text-xs ${AdminStyles.mutedTextLight} ${AdminStyles.mutedTextDark}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DataDisplayWrapper>
  );
};