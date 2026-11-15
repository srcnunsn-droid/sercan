import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import { FONTS } from './engine/effects';

// Canvas için web fontlarını önceden yükle
if (document.fonts) FONTS.forEach(f => [400, 700, 900].forEach(w => document.fonts.load(`${w} 40px "${f}"`).catch(() => {})));

createRoot(document.getElementById('root')!).render(<App />);
