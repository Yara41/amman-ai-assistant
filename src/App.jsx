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
  MapPin
} from 'lucide-react';
import './App.css';

export default function App() {

  const welcomeText =
    'مرحباً بك في مساعد إعادة التدوير – أمانة عمّان الكبرى 🌱\n\n' +
    'هذا النظام الذكي يهدف إلى تعزيز الوعي بإعادة التدوير في عمّان، ومساعدتك على فهم طرق فرز النفايات والممارسات البيئية الصحيحة وفق مبادرة AVTR.\n\nكيف يمكنني مساعدتك اليوم؟';

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

  // البطاقات بأسماء طبيعية وواضحة
  const quickQuestions = [
    {
      label: 'إرشادات فرز النفايات',
      prompt: 'كيف يمكنني فرز النفايات؟',
      icon: Recycle
    },
    {
      label: 'أنواع النفايات',
      prompt: 'ما هي أنواع النفايات التي يمكن إعادة تدويرها؟',
      icon: FileText
    },
    {
      label: 'أهمية إعادة التدوير',
      prompt: 'لماذا تعتبر إعادة التدوير مهمة؟',
      icon: Leaf
    },
    {
      label: 'ممارسات الاستدامة',
      prompt: 'ما هي أفضل ممارسات الاستدامة البيئية؟',
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

    // عرض السؤال الطبيعي للمستخدم في الشات
    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: messageText
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    saveToHistory(messageText);

    // الخدعة: إضافة التوجيه "مخفياً" فقط عند الإرسال للسيرفر (n8n)
   const hiddenInstructions = `أنت الآن المساعد الذكي الرسمي لأمانة عمان الكبرى ومبادرة AVTR. بناءً على معرفتك الواسعة في إعادة التدوير، أجب على السؤال التالي بلهجة رسمية ومهنية تخدم سكان مدينة عمان: ${messageText}`;
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: hiddenInstructions })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Unknown server error');
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.reply || data.output || data.text || 'تم استلام طلبك بنجاح من نظام الأمانة.'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Connection Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: 'عذراً، الخادم مشغول حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
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
              <p>مبادرة AVTR 🌱</p>
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

        {/* بطاقات الإحصائيات (المعلومات الجانبية) */}
        <div className="stats-container">
          <div className="stat-card green-stat">
            <span>5-10%</span>
            <p>معدل إعادة التدوير في عمان</p>
          </div>
          
          <div className="stat-card dark-stat">
            <span>~ 2 مليون طن</span>
            <p>معدل تولد النفايات سنوياً</p>
          </div>
          
          <div className="stat-card light-stat">
            <span>~ 4.06 مليون</span>
            <p>عدد سكان عمان (إحصائية 2021)</p>
          </div>
        </div>

        <div className="impact-card" style={{
          marginTop: '20px',
          background: 'linear-gradient(135deg, #165c43, #2d6a4f)',
          padding: '15px',
          borderRadius: '16px',
          color: 'white'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={16} /> أثرك البيئي اليوم
          </h4>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '11px', lineHeight: '1.4' }}>
            مشاركتك في الفرز تدعم رؤية عمان للمعالجة وإعادة التدوير (AVTR).
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
              onClick={() => window.open('https://avtr.jo', '_blank')}
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
              <p>اسأل المساعد الذكي عن طرق فرز النفايات ومبادرات إعادة التدوير في العاصمة.</p>
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
                <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}>
                  <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
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
                      جاري تحليل طلبك...
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
            <button onClick={handleSendMessage} disabled={isLoading} className="send-btn">
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