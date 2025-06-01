
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChatContainer } from '@/components/chat/ChatContainer';

const ChatPage = () => {
  return (
    <Layout>
      <div className="h-full">
        <ChatContainer />
      </div>
    </Layout>
  );
};

export default ChatPage;
