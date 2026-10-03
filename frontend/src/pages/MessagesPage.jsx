import { useParams } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ConversationList from '@/components/messages/ConversationList';
import ChatPanel from '@/components/messages/ChatPanel';
import { useGetConversationsQuery } from '@/services/messagesApi';

// Konuşma listesi yeni mesajlar için daha seyrek yoklanır (açık sohbet kendi içinde 5 sn'de bir yenilenir).
const LIST_POLL_INTERVAL_MS = 10000;

// /messages: masaüstünde solda konuşmalar, sağda sohbet. Mobilde konuşma seçiliyse sadece sohbet görünür.
export default function MessagesPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetConversationsQuery(undefined, {
    pollingInterval: LIST_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });

  return (
    <PageLayout>
      <h1 className={`text-2xl font-bold text-gray-900 mb-5 ${id ? 'hidden lg:block' : ''}`}>Messages</h1>

      <div className="card overflow-hidden grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)] h-[calc(100vh-12rem)] min-h-[480px]">
        <aside className={`min-h-0 lg:border-r border-gray-100 ${id ? 'hidden lg:block' : ''}`}>
          <ConversationList conversations={data?.data?.conversations} isLoading={isLoading} error={error} />
        </aside>

        <section className={`min-h-0 ${id ? '' : 'hidden lg:block'}`}>
          {id ? (
            <ChatPanel key={id} conversationId={id} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-6">
              <MessagesSquare size={32} />
              <p className="mt-3 text-sm">Select a conversation to start chatting.</p>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
