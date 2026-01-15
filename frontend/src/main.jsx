// import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChatProvider } from './context/useChat';
// import { ConsolePanel } from './components/ConsolePanel';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <ChatProvider>
    <App />
    {/* <ConsolePanel /> */}
  </ChatProvider>
  // </StrictMode>
);
