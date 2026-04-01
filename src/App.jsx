import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  FileText,
  Leaf,
  Recycle,
  Mail,
  Trash2,
  PanelRight,
  Plus,
  Sparkles,
  ExternalLink,
  Globe
} from 'lucide-react';
import './App.css';

export default function App() {

  const welcomeText =
    'مرحباً بك في مساعد أمانة عمان الذكي لإعادة التدوير 🌍\n\n' +
    'أنا هنا لمساعدتك في فهم نظام إدارة النفايات في العاصمة، وتقديم إرشادات حول الفرز الصحيح والممارسات المستدامة.\n\nكيف يمكنني مساعدتك اليوم؟';

  const initialMessage = {
    id: 1,
    role: 'ai',
    text: welcomeText
  };

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('amman_chat_messages');
    try {
      return savedMessages ? JSON.parse(savedMessages) : [initialMessage];
    } catch {
      return [initialMessage];
    }
  });

  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem('amman_chat_history');
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
      label: 'الفصل من المصدر',
      prompt: 'ما هو مفهوم "الفصل من المصدر" وكيف أطبقه؟',
      icon: Recycle
    },
    {
      label: 'حماية البيئة',
      prompt: 'كيف تساعد إعادة التدوير في حماية بيئة عمان؟',
      icon: Leaf
    },
    {
      label: 'الفرز المنزلي',
      prompt: 'ما هي أنواع النفايات التي يمكنني فرزها في المنزل؟',
      icon: FileText
    },
    {
      label: 'مبادئ الـ 3R\'s',
      prompt: 'تعرف على مبادئ الـ 3R\'s لإدارة النفايات.',
      icon: Sparkles
    }
  ];

  useEffect(() => {
    localStorage.setItem('amman_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('amman_chat_history', JSON.stringify(chatHistory));
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
    localStorage.setItem('amman_chat_messages', JSON.stringify([initialMessage]));
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

    const forcedPrompt = `بصفتك المساعد الذكي الرسمي لأمانة عمان الكبرى، أجب على هذا السؤال بأسلوب مهني وواضح: ${messageText}`;

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: forcedPrompt })
      });

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.reply || data.output || data.text || 'عذراً، لم أستطع معالجة طلبك حالياً.'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: 'عذراً، حدث خطأ في الاتصال.'
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
              <p style={{ fontSize: '11px' }}>Amman Smart Assistant</p>
            </div>
          </div>

          <button className="status-badge">
            <span className="status-dot"></span>
            AI ACTIVE
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

        {/* الروابط الرسمية (البطاقات الجديدة) */}
        <div className="links-group" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* بطاقة موقع أمانة عمان */}
          <button 
            className="link-card-btn" 
            onClick={() => window.open('https://www.ammancity.gov.jo', '_blank')}
            style={{ textAlign: 'right', padding: '12px', borderRadius: '12px', border: '1px solid #dde7e1', background: 'white', cursor: 'pointer' }}
          >
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#165c43' }}>موقع أمانة عمّان</div>
            <div style={{ fontSize: '11px', color: '#5b6b63' }}>خدمات البلدية وإدارة النفايات في العاصمة</div>
          </button>

          {/* بطاقة مبادرة AVTR */}
          <button 
            className="link-card-btn" 
            onClick={() => window.open('https://avtr.jo', '_blank')}
            style={{ textAlign: 'right', padding: '12px', borderRadius: '12px', border: '1px solid #dde7e1', background: 'white', cursor: 'pointer' }}
          >
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#165c43' }}>مبادرة AVTR</div>
            <div style={{ fontSize: '11px', color: '#5b6b63' }}>منصة لإعادة التدوير وتعزيز المشاركة المجتمعية</div>
          </button>
        </div>

      </aside>

      <div className="chat-layout">

        <header className="topbar">
          <div className="topbar-brand">
            <Recycle size={30} className="topbar-logo" />
            <div>
              {/* مساعد إعادة التدوير الذكي - أمانة عمان بخط خميل */}
              <h1 style={{ fontSize: '20px', fontWeight: '800' }}>مساعد إعادة التدوير الذكي - أمانة عمان</h1>
              <p style={{ fontSize: '12px' }}>Amman Smart Recycling Assistant</p>
            </div>
          </div>
          
          <div className="topbar-left">
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
                اسأل عن إدارة النفايات، الفرز، أو الاستدامة داخل المدينة.
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
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="messages-section">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}>
                  <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                    {msg.role === 'ai' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-row ai-row">
                  <div className="message-bubble ai-bubble">جاري المعالجة...</div>
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
              placeholder="اسأل عن النفايات في عمّان..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="chat-input"
            />

            <button onClick={handleSendMessage} disabled={isLoading} className="send-btn">
              <Send size={18} />
            </button>
          </div>

          <div className="footer-email">
            <Mail size={12} />
            <span>yarahyari41@gmail.com</span>
          </div>

          <button className="clear-chat-link" onClick={clearChat}>
            <Trash2 size={14} />
            <span>إعادة المحادثة</span>
          </button>
        </footer>

      </div>
    </div>
  );
}