import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import ChatInput from "@/components/chat-input";
import ChatMessages from "@/components/chat-messages";

export default function HomePage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Topbar />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl text-muted-foreground">
            <ChatMessages />
          </div>
        </div>

        {/* Prompt Input */}
        <ChatInput />
      </div>
    </div>
  );
}