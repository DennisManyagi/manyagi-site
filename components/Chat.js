import { useState } from 'react';
import { FaRobot } from 'react-icons/fa';
import axios from 'axios';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      const res = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-4',
        messages: [{ role: 'user', content: message }],
      }, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_XAI_API_KEY}` },
      });
      setResponse(res.data.choices[0].message.content);
    } catch (error) {
      setResponse('Error: Check https://x.ai/api for setup and keys.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-neutral-900 p-4 rounded-xl shadow-lg border border-neutral-800">
      <FaRobot className="text-emerald-400 mb-2 text-2xl" />
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask Grok..." className="w-full mb-2 p-2 border border-neutral-800 rounded bg-neutral-800 text-white" />
      <button onClick={handleSend} className="w-full py-2 bg-gold text-purple-900 rounded font-bold hover:bg-gold/90">Send</button>
      {response && <p className="mt-2 text-muted-foreground">{response}</p>}
      <p className="text-xs text-muted-foreground mt-2">Powered by xAI Grok 4 - <a href="https://x.ai/api" target="_blank" className="text-emerald-400">API Details</a></p>
    </div>
  );
};

export default Chat;