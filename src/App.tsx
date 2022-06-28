import { BrowserRouter } from 'react-router-dom';

import Routes from './Routes';
import UserProvider from './providers/UserProvider';

// CSS Import
import 'primereact/resources/themes/tailwind-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.min.css';
import './app.css';

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
