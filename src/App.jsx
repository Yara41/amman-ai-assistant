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
  MapPin,
  ExternalLink
} from 'lucide-react';
import './App.css';

export default function App() {

  const welcomeText =
    'مرحباً بك في مساعد إعادة التدوير الذكي – أمانة عمّان الكبرى 🌱\n\n' +
    'هذا النظام يهدف إلى دعم مبادرات عمان الخضراء وتعزيز الوعي بطرق فرز النفايات والممارسات البيئية المستدامة في مدينتنا.\n\nكيف يمكنني مساعدتك اليوم؟';

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

  // تحديث الأسئلة لتوجيه الـ AI برمجياً نحو هوية أمانة عمان
  const quickQuestions = [
    {
      label: 'فرز النفايات في عمان',
      prompt: 'بصفتك مساعد أمانة عمان الذكي، كيف يمكنني فرز النفايات بشكل صحيح في منزلي داخل عمان؟ اذكر الخطوات المتبعة في المدينة وتجاهل أي سياق جامعي.',
      icon: Recycle
    },
    {
      label: 'مراكز تجميع المواد',
      prompt: 'أين يمكنني العثور على حاويات إعادة التدوير أو مراكز التجميع التابعة لأمانة عمان (مثل مبادرة AVTR) في مناطق العاصمة؟',
      icon: MapPin
    },
    {
      label: 'النفايات الإلكترونية',
      prompt: 'كيف توفر أمانة عمان طرقاً للتخلص من النفايات الإلكترونية والأثاث القديم بشكل بيئي صحيح؟',
      icon: FileText
    },
    {
      label: 'رؤية عمان الخضراء',
      prompt: 'ما هي مبادرة Amman Vision (AVTR) وكيف تساهم في تحويل النفايات إلى مواد معاد تدويرها في الأردن؟',
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

    const userDisplayMessage = {
      id: Date.now(),
      role: 'user',
      text: messageText.includes('بصفتك مساعد أمانة عمان') ? 'كيف يمكنني فرز النفايات؟' : messageText 
    };

    setMessages((prev) => [...prev, userDisplayMessage]);
    setInputValue('');
    setIsLoading(true);
    saveToHistory(userDisplayMessage.text);

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
        text: data.reply || data.output || data.text || 'تم استلام رسالتك بنجاح من النظام.'
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
              <h2>مساعد عمان الذكي</h2>
              <p>رؤية عمان 2030 🌱</p>
            </div>
          </div>

          <button className="status-badge" type="button">
            <span className="status-dot"></span>
            نظام AVTR نشط
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

        {/* إضافة "حركة" الأثر البيئي المستوحاة من الموقع العالمي للمبادرة */}
        <div className="impact-card" style={{
          marginTop: 'auto',
          background: 'linear-gradient(135deg, #165c43, #2d6a4f)',
          padding: '20px',
          borderRadius: '20px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sparkles size={18} />
            <strong style={{ fontSize: '14px' }}>أثرك البيئي اليوم</strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.6', opacity: 0.9 }}>
            بمشاركتك في الفرز، تساهم في تقليل الانبعاثات الكربونية في عمّان. كل خطوة صغيرة تصنع فرقاً كبيراً!
          </p>
        </div>
      </aside>

      <div className="chat-layout">
        <header className="topbar">
          <div className="topbar-brand">
            <Recycle size={30} className="topbar-logo" />
            <div>
              <h1>مساعد إعادة التدوير – أمانة عمّان</h1>
              <p>نحو عاصمة خضراء ومستدامة</p>
            </div>
          </div>

          <div className="topbar-left">
            <button
              className="survey-btn"
              style={{ background: '#f3a81f', color: '#13231a' }}
              onClick={() =>
                window.open('https://www.ammanvision.jo/', '_blank')
              }
            >
              <ExternalLink size={18} />
              <span>مبادرة AVTR</span>
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
                استكشف مبادرات أمانة عمان لإعادة التدوير، وتعرف على طرق فرز النفايات
                في منطقتك من خلال المساعد الذكي.
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
                  className={`message-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}
                >
                  <div
                    className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}
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
                    <div style={{ display: 'flex', gap: '5px' }}>
                      جاري تحليل طلبك للأمانة...
                    </div>
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
              placeholder="اسأل عن مراكز التدوير في عمان..."
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
            <span>بدء جلسة جديدة</span>
          </button>
        </footer>
      </div>
    </div>
  );
}