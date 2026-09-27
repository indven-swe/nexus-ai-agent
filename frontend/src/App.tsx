import { useEffect, useMemo, useState } from 'react';

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
};

type ChatStep = {
  name: string;
  detail: string;
  provider?: 'ZeroScript' | 'Nilo' | 'Nexus';
};

const defaultConversationId = 'new';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeConversation, setActiveConversation] = useState<string>(defaultConversationId);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 'new', title: 'New conversation', updatedAt: Date.now() },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Welcome to Nexus. Tell me what you want to do and I will route the work through the right capability.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Thinking');
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ChatStep[]>([
    { name: 'Thinking', detail: 'Ready to help with a task.', provider: 'Nexus' },
  ]);
  const [view, setView] = useState<'chat' | 'settings'>('chat');

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const activeConversationTitle = useMemo(() => {
    const current = conversations.find((entry) => entry.id === activeConversation);
    return current?.title ?? 'New conversation';
  }, [activeConversation, conversations]);

  const handleCreateConversation = () => {
    const id = crypto.randomUUID();
    setActiveConversation(id);
    setMessages([
      { id: crypto.randomUUID(), role: 'assistant', content: 'New conversation started. What would you like Nexus to work on?' },
    ]);
    setConversations((prev) => [{ id, title: 'New conversation', updatedAt: Date.now() }, ...prev]);
    setError(null);
    setStatus('Thinking');
    setActivity([{ name: 'Thinking', detail: 'Ready for the next task.', provider: 'Nexus' }]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const workingConversationId = activeConversation === defaultConversationId ? crypto.randomUUID() : activeConversation;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);
    setStatus('Thinking');
    setActivity([{ name: 'Thinking', detail: 'Reviewing the request and choosing the route.', provider: 'Nexus' }]);

    if (activeConversation === defaultConversationId) {
      setActiveConversation(workingConversationId);
      setConversations((prev) => [{ id: workingConversationId, title: trimmed.slice(0, 28) || 'New conversation', updatedAt: Date.now() }, ...prev]);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          conversationId: workingConversationId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Request failed.' }));
        throw new Error(payload.error ?? 'Request failed.');
      }

      const payload = await response.json();
      const assistantReply = payload.response ?? 'I am ready to continue.';
      const nextSteps = payload.steps ?? [{ name: 'Finished', detail: 'Completed.', provider: 'Nexus' }];

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: assistantReply }]);
      setActivity(nextSteps);
      setStatus(payload.activity ?? 'Finished');
      setConversations((prev) =>
        prev.map((entry) =>
          entry.id === workingConversationId
            ? { ...entry, title: (entry.title === 'New conversation' ? trimmed.slice(0, 28) : entry.title), updatedAt: Date.now() }
            : entry,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setStatus('Error');
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `I hit an error while processing the request: ${message}` }]);
      setActivity([{ name: 'Error', detail: message, provider: 'Nexus' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setIsLoading(false);
    setStatus('Stopped');
    setActivity([{ name: 'Stopped', detail: 'The current task was cancelled.', provider: 'Nexus' }]);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">N</div>
          <div>
            <p className="eyebrow">Unified agent</p>
            <h1>Nexus</h1>
          </div>
        </div>

        <button className="primary-button" onClick={handleCreateConversation}>
          New conversation
        </button>

        <div className="sidebar-section">
          <p className="section-label">Recent</p>
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${activeConversation === conversation.id ? 'active' : ''}`}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <span>{conversation.title}</span>
                <small>{new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Current session</p>
            <h2>{activeConversationTitle}</h2>
          </div>

          <div className="topbar-actions">
            <button className={`tab-button ${view === 'chat' ? 'selected' : ''}`} onClick={() => setView('chat')}>
              Chat
            </button>
            <button className={`tab-button ${view === 'settings' ? 'selected' : ''}`} onClick={() => setView('settings')}>
              Settings
            </button>
          </div>
        </header>

        {view === 'chat' ? (
          <>
            <div className="content-grid">
              <section className="chat-panel">
                <div className="messages">
                  {messages.map((message) => (
                    <div key={message.id} className={`message-row ${message.role}`}>
                      <div className="message-bubble">
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="composer">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask Nexus to plan, write, analyze, or build..."
                    rows={3}
                    maxLength={2000}
                  />

                  <div className="composer-actions">
                    <button className="secondary-button" onClick={handleStop} disabled={!isLoading}>
                      Stop generation
                    </button>
                    <button className="primary-button" onClick={handleSend} disabled={!input.trim() || isLoading}>
                      {isLoading ? 'Working...' : 'Send'}
                    </button>
                  </div>
                </div>
              </section>

              <aside className="status-panel">
                <div className="status-card">
                  <p className="section-label">Agent activity</p>
                  <div className="status-pill">{status}</div>
                  <ul>
                    {activity.map((step) => (
                      <li key={`${step.name}-${step.detail}`}>
                        <strong>{step.name}</strong>
                        <span>{step.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="status-card">
                  <p className="section-label">Capabilities</p>
                  <div className="capability-list">
                    <span>ZeroScript</span>
                    <span>Nilo</span>
                    <span>Planning</span>
                    <span>Analysis</span>
                  </div>
                </div>

                {error && <div className="status-card error-card">{error}</div>}
              </aside>
            </div>
          </>
        ) : (
          <div className="settings-panel">
            <div className="settings-card">
              <p className="section-label">Appearance</p>
              <div className="toggle-row">
                <label className="toggle-label" htmlFor="theme-toggle">Dark mode</label>
                <input
                  id="theme-toggle"
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                />
              </div>
            </div>

            <div className="settings-card">
              <p className="section-label">Agent settings</p>
              <div className="settings-list">
                <div>
                  <strong>Identity</strong>
                  <span>Nexus</span>
                </div>
                <div>
                  <strong>Task routing</strong>
                  <span>Automatic</span>
                </div>
                <div>
                  <strong>Memory</strong>
                  <span>Session-based</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
