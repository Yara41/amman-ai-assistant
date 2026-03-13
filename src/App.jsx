import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  FileText,
  Leaf,
  Recycle,
  Mail,
  ClipboardCheck,
} from 'lucide-react';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text:
        'مرحباً بك في مساعد إعادة التدوير الذكي للجامعات الأردنية 🌱\n\n' +
        'أنا هنا لمساعدتكم في تعزيز الوعي البيئي وتقديم المعلومات الدقيقة حول ممارسات إعادة التدوير داخل الحرم الجامعي.\n\n' +
        'يمكنك الضغط على أحد الأسئلة المقترحة بالأسفل أو كتابة سؤالك مباشرة.\n\n' +
        'كيف يمكنني مساعدتك اليوم؟',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    {
      label: 'إرشادات فرز النفايات',
      prompt: 'كيف يمكن فرز النفايات بشكل صحيح داخل الحرم الجامعي؟',
      icon: Recycle,
    },
    {
      label: 'أنواع النفايات',
      prompt: 'ما هي أنواع النفايات التي يمكن أن تنتج داخل الجامعة؟',
      icon: FileText,
    },
    {
      label: 'أهمية إعادة التدوير',
      prompt: 'ما أهمية إعادة التدوير للبيئة والمجتمع؟',
      icon: Leaf,
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await fetch(
        'https://yarahyari41.app.n8n.cloud/webhook/recycling-assistant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: messageText,
          }),
        }
      );

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text:
          data.output ||
          data.text ||
          'تم استلام رسالتك بنجاح من نظام n8n.',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Connection Error:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: 'عذراً، حدثت مشكلة في الاتصال بالخادم. تأكدي من أن Webhook في n8n مفعل.',
        },
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    await sendMessage(inputValue);
  };

  const handleQuickQuestion = async (prompt) => {
    await sendMessage(prompt);
  };

  return (
    <div
      dir="rtl"
      className="ai-container"
      style={{
        backgroundColor: '#f8fafc',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        className="ai-header"
        style={{
          backgroundColor: '#1b4332',
          padding: '15px 25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Recycle size={35} style={{ color: '#40916c' }} />
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>
              Recycling AI Assistant
            </h1>
            <p style={{ color: '#b7e4c7', margin: 0, fontSize: '0.8rem' }}>
              نظام ذكي لتعزيز الوعي بإعادة التدوير في الجامعات الأردنية
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            window.open('https://forms.gle/W3xtwb49j7NsWHF59', '_blank')
          }
          style={{
            backgroundColor: '#fca311',
            color: '#14213d',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(252, 163, 17, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ffb703';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fca311';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ClipboardCheck size={18} />
          <span>شاركنا رأيك بالاستبيان</span>
        </button>
      </header>

      <main
        className="ai-main"
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="ai-message-wrapper"
            style={{
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className={`ai-speech-bubble ${msg.role === 'user' ? 'user-msg' : ''}`}
              style={{
                ...(msg.role === 'user'
                  ? {
                      backgroundColor: '#2d6a4f',
                      color: 'white',
                      alignSelf: 'flex-start',
                    }
                  : {
                      backgroundColor: 'white',
                      color: '#333',
                      alignSelf: 'flex-end',
                    }),
                maxWidth: '80%',
                padding: '12px 18px',
                borderRadius: '15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}

              {msg.id === 1 && (
                <div
                  style={{
                    marginTop: '14px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  {quickQuestions.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(item.prompt)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          color: '#1b4332',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#ecfdf5';
                          e.currentTarget.style.borderColor = '#95d5b2';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <Icon size={14} color="#1b4332" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </main>

      <footer
        className="ai-footer"
        style={{
          padding: '15px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          className="ai-search-bar"
          style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: '#f1f5f9',
            borderRadius: '25px',
            padding: '5px 15px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="اسأل عن طرق التدوير أو فرز النفايات..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px',
              outline: 'none',
              fontSize: '14px',
            }}
          />
          <button
            className="ai-send-btn"
            onClick={handleSendMessage}
            style={{
              background: '#1b4332',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={18} />
          </button>
        </div>

        <div
          className="ai-footer-note"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            marginTop: '10px',
            color: '#1b4332',
            fontSize: '11px',
            opacity: 0.8,
          }}
        >
          <Leaf size={14} />
          <span>يدعم هذا النظام أهداف التنمية المستدامة في المؤسسات التعليمية الأردنية</span>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#888',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '8px',
          }}
        >
          <Mail size={10} />
          <span>للتواصل العلمي: yarahyari41@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}