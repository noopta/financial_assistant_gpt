import React, { useState } from 'react';
import './Chat.css'; // Make sure to include the CSS file in the same directory

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    var isSent = true;

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, { text: input, sent: isSent }]);
            setInput('');
        }

        // flip the value of isSent
        isSent = !isSent;
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sent ? '' : 'received'}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            <form className="input-area" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatApp;
