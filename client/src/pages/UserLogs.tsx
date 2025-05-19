import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ModerationLog } from "@shared/schema";

export default function UserLogs() {
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  
  const { data: logs = [], isLoading } = useQuery<ModerationLog[]>({
    queryKey: ["/api/moderation-logs"],
  });

  const filteredLogs = logs
    .filter(log => 
      (filterType === "all" || log.actionType === filterType) &&
      (searchTerm === "" || 
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.messageContent && log.messageContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.performedBy && log.performedBy.toLowerCase().includes(searchTerm.toLowerCase())))
    );

  const paginatedLogs = filteredLogs.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

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

  const formatDateTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Logs</h1>
        <p className="text-gray-600">Track and review moderation activities across all users</p>
      </header>

      <Card>
        <CardHeader className="bg-primary text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold">Moderation Activity Logs</h2>
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
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search by user, message content or action details..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Loading moderation logs...</p>
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
                <path d="M13 2v7h7"></path>
                <line x1="9" y1="17" x2="15" y2="17"></line>
                <line x1="9" y1="12" x2="15" y2="12"></line>
              </svg>
              <p className="mt-2 text-gray-600">No moderation logs found.</p>
            </div>
          ) : (
            <>
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
                    {paginatedLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={formatDateTime(log.timestamp)}>
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
                          <div>
                            <p>{log.details}</p>
                            {log.messageContent && (
                              <p className="text-xs mt-1 text-gray-400 italic">
                                "{log.messageContent.length > 50 ? log.messageContent.substring(0, 50) + '...' : log.messageContent}"
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.performedBy === "bot" ? "Bot (Automatic)" : log.performedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-500">
                  Showing {paginatedLogs.length} of {filteredLogs.length} logs
                </p>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page + 1} of {totalPages || 1}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
