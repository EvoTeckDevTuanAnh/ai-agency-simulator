import type { Agent } from '../types';
import './CharacterPopup.css';

interface Props {
  character: Agent;
  onClose: () => void;
}

export function CharacterPopup({ character, onClose }: Props) {
  return (
    <div className="character-popup-overlay" onClick={onClose}>
      <div className="character-popup" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>✖</button>
        <h2>{character.name}</h2>
        <p className="popup-role">{character.role}</p>
        <p className="popup-id">ID: {character.id}</p>
      </div>
    </div>
  );
}
