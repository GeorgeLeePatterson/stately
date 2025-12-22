import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { runtime, StatelyProvider } from './lib/stately';

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: ''
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StatelyProvider runtime={runtime}>
          <App />
        </StatelyProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
