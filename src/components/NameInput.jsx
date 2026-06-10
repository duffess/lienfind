import { useState } from 'react';
import './NameInput.css';

export default function NameInput({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onSubmit(trimmed.substring(0, 30));
    }
  };

  return (
    <div className="name-overlay">
      <form className="name-card" onSubmit={handleSubmit}>
        <h2 className="name-title">CAÇA-PALAVRAS HIPOTECA</h2>
        <p className="name-subtitle">Digite seu nome para começar</p>
        <input
          className="name-input"
          type="text"
          placeholder="Seu nome..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoFocus
        />
        <button className="name-btn" type="submit" disabled={!name.trim()}>
          Jogar
        </button>
      </form>
    </div>
  );
}
