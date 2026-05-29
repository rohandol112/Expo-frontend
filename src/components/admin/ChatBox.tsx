import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  time: string;
  own?: boolean;
}

export function ChatBox({ messages }: { messages: ChatMessage[] }) {
  return (
    <div>
      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg bg-muted/30 p-4">
        {messages.map((message) => (
          <div key={message.id} className={message.own ? "ml-auto max-w-[78%]" : "max-w-[78%]"}>
            <div className={message.own ? "rounded-lg bg-primary p-3 text-primary-foreground" : "rounded-lg border bg-card p-3"}>
              <p className="text-xs font-medium">{message.sender}</p>
              <p className="mt-1 text-sm">{message.message}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{message.time}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="Type a reply..." />
        <Button>Send</Button>
      </div>
    </div>
  );
}
