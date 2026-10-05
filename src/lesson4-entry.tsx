import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Lesson4App from './Lesson4App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lesson4App />
  </StrictMode>
);
