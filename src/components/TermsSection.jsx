import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export const TermsSection = () => {
  const { terms } = useStore();
  const [activeId, setActiveId] = useState(null);

  const toggleItem = (id) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  return (
    <section id="termos" className="section-terms">
      <div className="container">
        <div className="section-header">
          <h2>Termos e Políticas da Loja</h2>
          <p>Transparência total e regras de convivência para todos os clientes.</p>
        </div>

        <div className="accordion">
          {terms.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div key={item.id} className={`accordion-item ${isActive ? 'active' : ''}`}>
                <div className="accordion-header" onClick={() => toggleItem(item.id)}>
                  <span>
                    <i className={item.icon || "fa-solid fa-circle-info"}></i> {item.title}
                  </span>
                  <i className="fa-solid fa-chevron-down" style={{ marginRight: 0 }}></i>
                </div>
                <div 
                  className="accordion-content" 
                  style={{ 
                    maxHeight: isActive ? '300px' : '0px',
                    paddingBottom: isActive ? '22px' : '0px'
                  }}
                >
                  <p style={{ paddingTop: '12px' }}>{item.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
