import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RoundListPage } from './pages/RoundListPage';
import { RoundPage } from './pages/RoundPage';
import { StoreProvider } from './stores';

const ProtectedRoute = observer(() => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to='/login' replace />;
});

const App = observer(() => {
  return (
    <StoreProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/login' element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path='/rounds' element={<RoundListPage />} />
              <Route path='/rounds/:id' element={<RoundPage />} />
            </Route>

            <Route path='*' element={<Navigate to='/rounds' replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </StoreProvider>
  );
});

export default App;
