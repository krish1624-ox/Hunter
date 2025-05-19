import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ModerationLog } from "@shared/schema";

export default function ActivityTable() {
  const [filterType, setFilterType] = useState("all");
  
  const { data: logs = [], isLoading } = useQuery<ModerationLog[]>({
    queryKey: ["/api/moderation-logs"],
  });

  const getFilteredLogs = () => {
    if (filterType === "all") return logs.slice(0, 5);
    return logs.filter(log => log.actionType === filterType).slice(0, 5);
  };

  const getActionBadgeClass = (actionType: string) => {
    switch (actionType) {
      case "delete":
        return "bg-red-100 text-red-800";
      case "warn":
        return "bg-yellow-100 text-yellow-800";
      case "mute":
        return "bg-purple-100 text-purple-800";
      case "ban":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval}y ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval}mo ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval}d ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval}h ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval}m ago`;
    
    return `${Math.floor(seconds)}s ago`;
  };

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case "delete":
        return "Deleted Message";
      case "warn":
        return "Warning";
      case "mute":
        return "Muted";
      case "ban":
        return "Banned";
      default:
        return actionType;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="bg-primary text-white px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold">Recent Moderation Activity</h2>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="bg-white bg-opacity-20 text-white border-none w-[140px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="delete">Deleted Messages</SelectItem>
            <SelectItem value="warn">Warnings</SelectItem>
            <SelectItem value="mute">Mutes</SelectItem>
            <SelectItem value="ban">Bans</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    Loading activity logs...
                  </td>
                </tr>
              ) : getFilteredLogs().length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No moderation activity found.
                  </td>
                </tr>
              ) : (
                getFilteredLogs().map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">User #{log.telegramUserId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.actionType)}`}>
                        {getActionText(log.actionType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span>{log.details}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.performedBy === "bot" ? "Bot (Automatic)" : log.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {getFilteredLogs().length} of {logs.length} actions
          </p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={true}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={getFilteredLogs().length >= logs.length}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
