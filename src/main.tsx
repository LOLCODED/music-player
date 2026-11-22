import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/mobile.css';
import './styles/skins/default.css';
import './styles/skins/lcd-player.css';
import './styles/skins/itunes.css';
import './styles/skins/y2k.css';
import './styles/skins/futurism.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);