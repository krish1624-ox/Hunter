import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickCommands from "@/components/dashboard/QuickCommands";
import FilteredWordsTable from "@/components/dashboard/FilteredWordsTable";
import ActivityTable from "@/components/dashboard/ActivityTable";

interface StatsData {
  messagesFiltered: {
    today: number;
    week: number;
    total: number;
  };
  warningsIssued: {
    today: number;
    week: number;
    total: number;
  };
  usersMuted: {
    today: number;
    week: number;
    total: number;
  };
  usersBanned: {
    today: number;
    week: number;
    total: number;
  };
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  // Default values until data loads
  const defaultStats = {
    messagesFiltered: { today: 0, week: 0, total: 0 },
    warningsIssued: { today: 0, week: 0, total: 0 },
    usersMuted: { today: 0, week: 0, total: 0 },
    usersBanned: { today: 0, week: 0, total: 0 }
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Manage your Telegram group moderation</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Messages Filtered"
          value={currentStats.messagesFiltered.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          }
          color="border-primary"
          todayValue={currentStats.messagesFiltered.today}
          weekValue={currentStats.messagesFiltered.week}
        />
        
        <StatsCard
          title="Warnings Issued"
          value={currentStats.warningsIssued.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          }
          color="border-warning"
          todayValue={currentStats.warningsIssued.today}
          weekValue={currentStats.warningsIssued.week}
        />
        
        <StatsCard
          title="Users Muted"
          value={currentStats.usersMuted.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          }
          color="border-danger"
          todayValue={currentStats.usersMuted.today}
          weekValue={currentStats.usersMuted.week}
        />
        
        <StatsCard
          title="Users Banned"
          value={currentStats.usersBanned.total}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          }
          color="border-dark"
          todayValue={currentStats.usersBanned.today}
          weekValue={currentStats.usersBanned.week}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Commands */}
        <div className="lg:col-span-1">
          <QuickCommands />
        </div>

        {/* Filtered Words Table */}
        <div className="lg:col-span-2">
          <FilteredWordsTable />
        </div>
      </div>

      {/* Recent Activity Table */}
      <ActivityTable />
    </div>
  );
}
