import { useState } from 'react';
import FloatingChatButton from './chat/FloatingChatButton';
import ChatDrawer from './chat/ChatDrawer';

const AIAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <FloatingChatButton 
                isOpen={isOpen} 
                onClick={() => setIsOpen(true)} 
            />
            <ChatDrawer 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
            />
        </>
    );
};

export default AIAssistantWidget;
