import React, { useState, useEffect, useRef } from 'react';
import { Send, Leaf, Recycle, Mail, ClipboardCheck } from 'lucide-react';
import './App.css';

export default function App() {

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text:
        'مرحباً بك في مساعد إعادة التدوير الذكي للجامعات الأردنية 🌱\n\n' +
        'أنا هنا لمساعدتكم في تعزيز الوعي البيئي وتقديم المعلومات الدقيقة حول ممارسات إعادة التدوير داخل الحرم الجامعي.\n\n' +
        'يمكنك الضغط على أحد الأسئلة المقترحة بالأعلى أو كتابة سؤالك مباشرة.\n\n' +
        'كيف يمكنني مساعدتك اليوم؟'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    {
      label: 'إرشادات فرز النفايات',
      prompt: 'كيف يمكن فرز النفايات بشكل صحيح داخل الحرم الجامعي؟',
    },
    {
      label: 'أنواع النفايات',
      prompt: 'ما هي أنواع النفايات التي يمكن أن تنتج داخل الجامعة؟',
    },
    {
      label: 'أهمية إعادة التدوير',
      prompt: 'ما أهمية إعادة التدوير للبيئة والمجتمع؟',
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
      text: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {

      const response = await fetch(
        'https://yarahyari41.app.n8n.cloud/webhook/recycling-assistant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: messageText
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
          'تم استلام رسالتك بنجاح من نظام n8n.'
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {

      console.error('Connection Error:', error);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text:
            'عذراً، حدثت مشكلة في الاتصال بالخادم. تأكدي من أن Webhook في n8n مفعل.'
        }
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
        flexDirection: 'column'
      }}
    >

      {/* HEADER */}

      <header
        className="ai-header"
        style={{
          backgroundColor: '#1b4332',
          padding: '15px 25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
            window.open(
              'https://forms.gle/W3xtwb49j7NsWHF59',
              '_blank'
            )
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
            gap: '8px'
          }}
        >

          <ClipboardCheck size={18} />

          <span>شاركنا رأيك بالاستبيان</span>

        </button>

      </header>


      {/* MESSAGES */}

      <main
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}
      >

        {/* QUICK QUESTIONS */}

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >

          {quickQuestions.map((item, index) => (

            <button
              key={index}
              onClick={() => handleQuickQuestion(item.prompt)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '20px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1b4332'
              }}
            >

              {item.label}

            </button>

          ))}

        </div>


        {messages.map((msg) => (

          <div
            key={msg.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >

            <div
              style={{
                ...(msg.role === 'user'
                  ? {
                      backgroundColor: '#2d6a4f',
                      color: 'white',
                      alignSelf: 'flex-start'
                    }
                  : {
                      backgroundColor: 'white',
                      color: '#333',
                      alignSelf: 'flex-end'
                    }),
                maxWidth: '80%',
                padding: '12px 18px',
                borderRadius: '15px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}
            >

              {msg.text}

            </div>

          </div>

        ))}

        <div ref={messagesEndRef} />

      </main>


      {/* INPUT */}

      <footer
        style={{
          padding: '15px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0'
        }}
      >

        <div
          style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: '#f1f5f9',
            borderRadius: '25px',
            padding: '5px 15px',
            alignItems: 'center'
          }}
        >

          <input
            type="text"
            placeholder="اسأل عن طرق فرز النفايات أو إعادة التدوير..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleSendMessage()
            }
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              padding: '10px',
              outline: 'none'
            }}
          />

          <button
            onClick={handleSendMessage}
            style={{
              background: '#1b4332',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              padding: '10px',
              cursor: 'pointer'
            }}
          >

            <Send size={18} />

          </button>

        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#888',
            marginTop: '8px'
          }}
        >

          <Mail size={10} />

          للتواصل العلمي: yarahyari41@gmail.com

        </div>

      </footer>

    </div>

  );
}