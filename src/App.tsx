import { BrowserRouter } from 'react-router-dom';

import Routes from './routes';
import UserProvider from './providers/UserProvider';
import ToastProvider from './providers/ToastProvider';

// CSS Import
import 'primereact/resources/themes/tailwind-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.min.css';
import './app.css';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <UserProvider>
          <Routes />
        </UserProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
