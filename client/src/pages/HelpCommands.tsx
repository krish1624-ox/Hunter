import { CopyButton } from "@/components/ui/copy-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommandInfo {
  command: string;
  description: string;
  example: string;
  usage: string;
}

export default function HelpCommands() {
  const adminCommands: CommandInfo[] = [
    {
      command: "/addfilter [word]",
      description: "Add a word to the filter list. Messages containing this word will be automatically filtered according to your settings.",
      example: "/addfilter badword",
      usage: "Use in your group chat to add a new filtered word."
    },
    {
      command: "/warn @username [reason]",
      description: "Issue a warning to a user. Warnings are tracked and can trigger automatic actions when thresholds are reached.",
      example: "/warn @user1 Posting inappropriate content",
      usage: "Use this when a user violates group rules."
    },
    {
      command: "/mute @username [duration]",
      description: "Temporarily restrict a user from sending messages. Duration can be specified in minutes (m), hours (h), days (d), or weeks (w).",
      example: "/mute @user1 24h",
      usage: "Mute a user for a specific duration."
    },
    {
      command: "/unmute @username",
      description: "Remove mute restriction from a previously muted user, allowing them to send messages again.",
      example: "/unmute @user1",
      usage: "Use this when you want to remove a user's mute early."
    },
    {
      command: "/ban @username [reason]",
      description: "Ban a user from the group. The user will be removed and unable to rejoin via invite links.",
      example: "/ban @user1 Repeated rule violations",
      usage: "Use for serious or repeated violations."
    },
    {
      command: "/unban @username",
      description: "Remove ban from a previously banned user, allowing them to rejoin the group.",
      example: "/unban @user1",
      usage: "Use this when you want to allow a banned user back into the group."
    },
    {
      command: "/settings",
      description: "View the current bot settings for the group, including warning thresholds and filter actions.",
      example: "/settings",
      usage: "Check the current configuration of the bot."
    },
    {
      command: "/stats",
      description: "Display moderation statistics for the group, including counts of filtered messages, warnings, and other actions.",
      example: "/stats",
      usage: "Use to get an overview of moderation activity."
    }
  ];

  const userCommands: CommandInfo[] = [
    {
      command: "/help",
      description: "Show the help message with available commands and their usage.",
      example: "/help",
      usage: "Get a list of commands you can use."
    },
    {
      command: "/status",
      description: "Check your current warning status, including the number of warnings received.",
      example: "/status",
      usage: "Use to see your current moderation status."
    }
  ];

  const faqs = [
    {
      question: "How do I add the bot to my group?",
      answer: "To add the bot to your group, open your Telegram group, go to group settings, then select 'Add members' and search for your bot's username. Make sure to promote the bot to admin with appropriate permissions."
    },
    {
      question: "What permissions does the bot need?",
      answer: "The bot needs the following permissions to function properly: Delete messages, Ban users, Restrict members, Add new admins, and Pin messages."
    },
    {
      question: "How are warnings tracked?",
      answer: "Warnings are tracked per user across the group. When a user reaches the warning threshold configured in your bot settings, automatic actions (like muting or banning) can be triggered."
    },
    {
      question: "Can I customize which words are filtered?",
      answer: "Yes, you can customize the filter list through the web dashboard or by using the /addfilter command directly in your group."
    },
    {
      question: "How long do warnings last?",
      answer: "By default, warnings are permanent until manually removed. However, you can configure the bot to reset warnings after a certain period in the settings."
    },
    {
      question: "What happens when a message is filtered?",
      answer: "When a message contains a filtered word, it can be automatically deleted, and the user can receive a warning, depending on your configuration."
    },
    {
      question: "Can I export moderation logs?",
      answer: "Yes, moderation logs can be viewed and exported from the web dashboard under the 'User Logs' section."
    }
  ];

  return (
    <div className="container mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Help & Commands</h1>
        <p className="text-gray-600">Learn how to use the Telegram moderation bot effectively</p>
      </header>

      <div className="grid gap-6">
        <Tabs defaultValue="commands" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="commands">Bot Commands</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="commands" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="bg-primary text-white px-4 py-3">
                  <h2 className="font-semibold">Admin Commands</h2>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    These commands can only be used by group administrators to manage moderation.
                  </p>
                  
                  <div className="grid gap-4">
                    {adminCommands.map((cmd, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <code className="text-sm font-mono font-semibold text-primary">{cmd.command}</code>
                          <CopyButton value={cmd.command} />
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{cmd.description}</p>
                        <div className="mt-2 flex flex-col sm:flex-row sm:gap-4">
                          <div className="mt-1 sm:mt-0">
                            <span className="text-xs font-semibold text-gray-500">Example:</span>
                            <code className="text-xs ml-1 bg-gray-100 px-1 py-0.5 rounded">{cmd.example}</code>
                          </div>
                          <div className="mt-1 sm:mt-0">
                            <span className="text-xs font-semibold text-gray-500">Usage:</span>
                            <span className="text-xs ml-1 text-gray-600">{cmd.usage}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-primary text-white px-4 py-3">
                  <h2 className="font-semibold">User Commands</h2>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    These commands can be used by any group member.
                  </p>
                  
                  <div className="grid gap-4">
                    {userCommands.map((cmd, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <code className="text-sm font-mono font-semibold text-primary">{cmd.command}</code>
                          <CopyButton value={cmd.command} />
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{cmd.description}</p>
                        <div className="mt-2 flex flex-col sm:flex-row sm:gap-4">
                          <div className="mt-1 sm:mt-0">
                            <span className="text-xs font-semibold text-gray-500">Example:</span>
                            <code className="text-xs ml-1 bg-gray-100 px-1 py-0.5 rounded">{cmd.example}</code>
                          </div>
                          <div className="mt-1 sm:mt-0">
                            <span className="text-xs font-semibold text-gray-500">Usage:</span>
                            <span className="text-xs ml-1 text-gray-600">{cmd.usage}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardHeader className="bg-primary text-white px-4 py-3">
                <h2 className="font-semibold">Frequently Asked Questions</h2>
              </CardHeader>
              <CardContent className="p-4">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="setup" className="mt-6">
            <Card>
              <CardHeader className="bg-primary text-white px-4 py-3">
                <h2 className="font-semibold">Bot Setup Guide</h2>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                <Alert>
                  <AlertDescription>
                    Make sure your bot is set up correctly to enable all moderation features. Follow these steps to get started.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Step 1: Create a Telegram Bot</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                      <li>Talk to <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@BotFather</a> on Telegram</li>
                      <li>Send the command <code className="bg-gray-100 px-1 py-0.5 rounded">/newbot</code> and follow the instructions</li>
                      <li>Copy the API token provided by BotFather</li>
                      <li>Add the token to your environment variables as <code className="bg-gray-100 px-1 py-0.5 rounded">TELEGRAM_BOT_TOKEN</code></li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Step 2: Add the Bot to Your Group</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                      <li>Open your Telegram group</li>
                      <li>Tap on the group name at the top to access group info</li>
                      <li>Tap "Add members"</li>
                      <li>Search for your bot's username and add it</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Step 3: Grant Admin Permissions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                      <li>In your group info, tap "Administrators"</li>
                      <li>Tap "Add Admin" and select your bot</li>
                      <li>Enable these permissions:
                        <ul className="list-disc list-inside ml-6 mt-1">
                          <li>Delete messages</li>
                          <li>Ban users</li>
                          <li>Restrict members</li>
                        </ul>
                      </li>
                      <li>Save the changes</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Step 4: Configure Moderation Settings</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                      <li>Go to the "Bot Settings" tab in this dashboard</li>
                      <li>Set your warning thresholds and default actions</li>
                      <li>Add filtered words in the "Filter Words" tab</li>
                      <li>Test your bot by using the <code className="bg-gray-100 px-1 py-0.5 rounded">/help</code> command in your group</li>
                    </ol>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Need more help?</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>For more detailed instructions and troubleshooting, check the <a href="#" className="font-medium underline">full documentation</a> or contact our support team.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
