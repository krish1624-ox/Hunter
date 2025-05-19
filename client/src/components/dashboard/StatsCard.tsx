import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  todayValue: number;
  weekValue: number;
}

export default function StatsCard({ title, value, icon, color, todayValue, weekValue }: StatsCardProps) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          </div>
          <div className="text-primary">
            {icon}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Today: {todayValue} • Last 7 days: {weekValue}
        </p>
      </CardContent>
    </Card>
  );
}
