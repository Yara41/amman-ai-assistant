import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  FileText,
  Leaf,
  Recycle,
  Mail,
  ClipboardCheck,
  Trash2,
  PanelRight,
  Plus,
  Sparkles
} from 'lucide-react';
import './App.css';

export default function App() {

  const welcomeText =
    'مرحباً بك في مساعد إعادة التدوير – أمانة عمّان الكبرى 🌱\n\n' +
    'هذا النظام الذكي يهدف إلى تعزيز الوعي بإعادة التدوير في عمّان، ومساعدتك على فهم طرق فرز النفايات والممارسات البيئية الصحيحة.\n\nكيف يمكنني مساعدتك اليوم؟';

  const initialMessage = {
    id: 1,
    role: 'ai',
    text: welcomeText
  };

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    try {
      return savedMessages ? JSON.parse(savedMessages) : [initialMessage];
    } catch {
      return [initialMessage];
    }
  });

  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    try {
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    {
      label: 'فرز النفايات',
      prompt: 'كيف يمكنني فرز النفايات بشكل صحيح في المنزل أو في عمّان؟',
      icon: Recycle
    },
    {
      label: 'أنواع القابلة للتدوير',
      prompt: 'ما هي النفايات التي يمكن إعادة تدويرها؟',
      icon: FileText
    },
    {
      label: 'أهمية إعادة التدوير',
      prompt: 'لماذا تعتبر إعادة التدوير مهمة للبيئة؟',
      icon: Leaf
    },
    {
      label: 'سلوكيات بيئية',
      prompt: 'ما هي أفضل الممارسات البيئية التي يمكنني اتباعها يومياً؟',
      icon: Sparkles
    }
  ];

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const createChatTitle = (text) => {
    const clean = text.trim();
    return clean.length > 28 ? clean.slice(0, 28) + '...' : clean;
  };

  const saveToHistory = (question) => {
    const title = createChatTitle(question);

    setChatHistory((prev) => {
      const updated = [title, ...prev.filter((item) => item !== title)];
      return updated.slice(0, 6);
    });
  };

  const clearChat = () => {
    setMessages([initialMessage]);
    localStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
  };

  const startNewChat = () => {
    clearChat();
    setInputValue('');
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: messageText
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    saveToHistory(messageText);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Unknown server error');
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text:
          data.reply ||
          data.output ||
          data.text ||
          'تم استلام رسالتك بنجاح من النظام.'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Connection Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: 'الخادم غير متاح حالياً، حاول لاحقاً.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickQuestion = (prompt) => {
    sendMessage(prompt);
  };

  const isOnlyWelcome =
    messages.length === 1 &&
    messages[0].role === 'ai' &&
    messages[0].text === welcomeText;

  return (
    <div className="app-shell" dir="rtl">

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand-box">
            <div className="brand-icon">
              <Recycle size={20} />
            </div>
            <div>
              <h2>مساعد إعادة التدوير</h2>
              <p>أمانة عمّان الكبرى</p>
            </div>
          </div>

          <button className="status-badge" type="button">
            <span className="status-dot"></span>
            AI Active
          </button>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          <Plus size={16} />
          <span>محادثة جديدة</span>
        </button>

        <div className="history-box">
          <h3>السجل الأخير</h3>

          {chatHistory.length === 0 ? (
            <p className="history-empty">لا توجد محادثات بعد</p>
          ) : (
            <ul className="history-list">
              {chatHistory.map((item, index) => (
                <li key={index} className="history-item">
                  <span className="history-dot"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="chat-layout">

        <header className="topbar">
          <div className="topbar-brand">
            <Recycle size={30} className="topbar-logo" />
            <div>
              <h1>مساعد إعادة التدوير – أمانة عمّان الكبرى</h1>
              <p>نظام ذكي لتعزيز الوعي بإعادة التدوير والسلوكيات البيئية</p>
            </div>
          </div>

          <div className="topbar-left">
            <button
              className="survey-btn"
              onClick={() =>
                window.open('https://forms.gle/W3xtwb49j7NsWHF59', '_blank')
              }
            >
              <ClipboardCheck size={18} />
              <span>شاركنا رأيك</span>
            </button>

            <button
              className="icon-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <PanelRight size={18} />
            </button>
          </div>
        </header>

        <main className="chat-main">
          {isOnlyWelcome ? (
            <section className="welcome-section">
              <div className="welcome-icon">
                <Recycle size={40} />
              </div>

              <h2>معاً نحو عمّان أكثر استدامة 🌍</h2>
              <p>
                اسأل عن إعادة التدوير، فرز النفايات، أو السلوكيات البيئية اليومية،
                وسأساعدك بمعلومات بسيطة وعملية.
              </p>

              <div className="quick-grid">
                {quickQuestions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={index}
                      className="quick-card"
                      onClick={() => handleQuickQuestion(item.prompt)}
                    >
                      <div className="quick-card-icon">
                        <Icon size={16} />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="messages-section">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-row ${
                    msg.role === 'user' ? 'user-row' : 'ai-row'
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      msg.role === 'user' ? 'user-bubble' : 'ai-bubble'
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-row ai-row">
                  <div className="message-bubble ai-bubble">
                    جاري التفكير...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </section>
          )}
        </main>

        <footer className="chat-footer">
          <div className="input-shell">
            <input
              type="text"
              placeholder="اسأل عن إعادة التدوير أو فرز النفايات..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="chat-input"
            />

            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="footer-email">
            <Mail size={12} />
            <span>للتواصل العلمي: yarahyari41@gmail.com</span>
          </div>

          <button className="clear-chat-link" onClick={clearChat}>
            <Trash2 size={14} />
            <span>مسح المحادثة</span>
          </button>
        </footer>
      </div>
    </div>
  );
}