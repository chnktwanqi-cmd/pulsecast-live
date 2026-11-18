import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router';
import { applyTokens } from './config/tokens';
import { DemoStoreProvider } from './data/store';
import './index.css';

applyTokens();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoStoreProvider>
        <AppRouter />
      </DemoStoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
