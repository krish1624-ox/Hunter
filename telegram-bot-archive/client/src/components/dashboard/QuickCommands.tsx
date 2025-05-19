import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

interface CommandItem {
  command: string;
  description: string;
}

const commands: CommandItem[] = [
  {
    command: "/addfilter [word]",
    description: "Add a word to filter list"
  },
  {
    command: "/warn @username [reason]",
    description: "Issue a warning to a user"
  },
  {
    command: "/mute @username [duration]",
    description: "Mute a user for specified time"
  },
  {
    command: "/ban @username [reason]",
    description: "Ban a user from the group"
  }
];

export default function QuickCommands() {
  return (
    <Card className="h-full">
      <CardHeader className="bg-primary text-white px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold">Quick Commands</h2>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-gray-700 mb-3">Use these commands in your Telegram group:</p>
        
        {commands.map((cmd, index) => (
          <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center">
              <code className="text-sm font-mono">{cmd.command}</code>
              <CopyButton value={cmd.command} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{cmd.description}</p>
          </div>
        ))}
        
        <a 
          href="/help" 
          className="text-primary text-sm hover:underline flex items-center mt-2"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/help";
          }}
        >
          <span>View all commands</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </CardContent>
    </Card>
  );
}
