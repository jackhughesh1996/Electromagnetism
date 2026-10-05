import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Lesson3App from './Lesson3App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lesson3App />
  </StrictMode>
);
