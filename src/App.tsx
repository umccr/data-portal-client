import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import Routes from './routes';
import UserProvider from './providers/UserProvider';
import ToastProvider from './providers/ToastProvider';

// CSS Import
import 'primereact/resources/themes/tailwind-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.min.css';
import './app.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <UserProvider>
            <Routes />
          </UserProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
