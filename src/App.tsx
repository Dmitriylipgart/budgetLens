import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Merchants } from './pages/Merchants';
import { Categories } from './pages/Categories';
import { Upload } from './pages/Upload';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
