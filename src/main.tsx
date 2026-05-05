import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { SynthetixGuard } from './components/SynthetixGuard.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SynthetixGuard>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </SynthetixGuard>
  </StrictMode>,
);
