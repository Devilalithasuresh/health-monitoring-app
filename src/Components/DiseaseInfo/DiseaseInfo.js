import React, { useState } from "react";
import "./DiseaseInfo.css";
import { diseaseDictionary } from "./DiseaseData";
import { useNavigate } from "react-router-dom";

const DiseaseInfo = () => {
  const [activeTab, setActiveTab] = useState("dictionary");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState([
    { role: "bot", content: "Hello! Please list your symptoms, and I will predict the potential condition and advise you. \n\n(Note: I am an AI, not a doctor. Always consult a real physician.)" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const filteredDiseases = diseaseDictionary.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newChat = [...chatHistory, { role: "user", content: userInput }];
    setChatHistory(newChat);
    setUserInput("");
    setIsTyping(true);

    setTimeout(() => {
      const userSymptoms = newChat[newChat.length - 1].content.toLowerCase();
      let bestMatch = null;
      let maxScore = 0;

      for (const disease of diseaseDictionary) {
        let score = 0;
        for (const sym of disease.symptoms) {
          if (userSymptoms.includes(sym.toLowerCase())) {
            score++;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestMatch = disease;
        }
      }

      let responseText = "";
      if (bestMatch && maxScore > 0) {
        responseText = `Based on your symptoms, a possible condition could be: ${bestMatch.name}\n\n⚠️ Precautions you should take:\n- ${bestMatch.precautions.join('\n- ')}\n\n*(Note: I am a localized Symptom Checker matching your keywords. Please consult a real doctor for an exact diagnosis!)*`;
      } else {
        responseText = "I'm having trouble identifying a specific condition based on those symptoms from my database. Could you please describe them differently (e.g., 'fever', 'cough', 'headache')? Remember to always consult a physician.";
      }

      setChatHistory([...newChat, { role: "bot", content: responseText }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="disease-dashboard-layout">
      <aside className="sidebar">
        <h2>🏥 Smart Health</h2>
        <ul>
          <li onClick={() => navigate("/dashboard")}>User Dashboard</li>

          <li onClick={() => navigate("/outbreak-map")}>Outbreak Map</li>
          <li className="active">Disease AI & Info</li>
        </ul>
      </aside>

      <main className="disease-main-content">
        <header className="disease-header glass-card">
          <h1>Medical Intelligence</h1>
          <p>Search our disease database or consult our AI Chatbot regarding your symptoms.</p>
          <div className="tab-switcher">
            <button
              className={activeTab === "dictionary" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("dictionary")}
            >
              📖 Disease Dictionary
            </button>
            <button
              className={activeTab === "chatbot" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("chatbot")}
            >
              🤖 AI Symptom Checker
            </button>
          </div>
        </header>

        {activeTab === "dictionary" && (
          <section className="dictionary-view">
            <input
              type="text"
              className="search-input"
              placeholder="Search diseases or symptoms (e.g., Fever, Cough)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="disease-grid">
              {filteredDiseases.map((disease, idx) => (
                <div key={idx} className="disease-card glass-card">
                  <h3>{disease.name}</h3>
                  <div className="card-section">
                    <h4>Symptoms:</h4>
                    <ul>
                      {disease.symptoms.map((sym, i) => <li key={i}>{sym}</li>)}
                    </ul>
                  </div>
                  <div className="card-section">
                    <h4>Precautions:</h4>
                    <ul>
                      {disease.precautions.map((pre, i) => <li key={i}>{pre}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
              {filteredDiseases.length === 0 && <p className="no-results">No diseases found matching your search.</p>}
            </div>
          </section>
        )}

        {activeTab === "chatbot" && (
          <section className="chatbot-view glass-card">
            <div className="chat-window">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-bubble-container ${msg.role === "user" ? "user-container" : "bot-container"}`}>
                  <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                    {msg.role === "bot" && <strong>🤖 AI Assistant</strong>}
                    {msg.role === "user" && <strong>👤 You</strong>}
                    <p style={{ whiteSpace: "pre-line", marginTop: "5px" }}>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble-container bot-container">
                  <div className="chat-bubble bot-bubble typing-indicator">
                    🤖 AI is analyzing your symptoms...
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="E.g., I have a high fever, dry cough, and headache..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage} disabled={isTyping}>Send</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default DiseaseInfo;
