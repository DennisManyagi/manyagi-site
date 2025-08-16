import { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      const res = await axios.post('https://api.x.ai/v1/chat/completions', { // Placeholder endpoint
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
    <div className="fixed bottom-4 right-4 bg-card p-4 rounded shadow-card border border-line">
      <FaRobot className="text-accent mb-2" />
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask AI..." className="w-full mb-2 p-2 border border-line rounded" />
      <button onClick={handleSend} className="btn w-full">Send</button>
      {response && <p className="mt-2 text-muted">{response}</p>}
      <p className="text-sm text-muted mt-2">Powered by xAI - Visit <a href="https://x.ai/api" target="_blank" rel="noopener noreferrer" className="text-accent">https://x.ai/api</a> for details.</p>
    </div>
  );
};

export default Chat;