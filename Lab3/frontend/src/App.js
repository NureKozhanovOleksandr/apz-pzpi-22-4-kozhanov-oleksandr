import './App.css';
import Navigation from './components/navigation/navigation';
import NotFound from './pages/notFound/notFound';
import Customers from './pages/customers';
import Admins from './pages/admins';
import Subscriptions from './pages/subscriptions';
import UserSubscriptions from './pages/user-subscriptions';
import { Routes, Route } from "react-router-dom";
import { useEffect, useContext } from 'react';
import { useCookies } from 'react-cookie';
import i18n from './configs/locale';
import { AuthContext } from './contexts/authContext';
import { LoginForm } from './components/forms/login';

function App() {
  const [cookies, setCookie] = useCookies(['language']);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const currentLanguage = cookies.language || 'en';
    i18n.changeLanguage(currentLanguage);
  }, [cookies.language]);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setCookie('language', language, { path: '/', maxAge: 24 * 60 * 60 });
  };

  return (
    <div className="app">
      {isAuthenticated && <Navigation changeLanguage={changeLanguage} />}
      <Routes>
        <Route path='/' element={<LoginForm changeLanguage={changeLanguage} />} />
        <Route path='/customers' element={<Customers />} />        
        <Route path="/customers/user/:userId" element={<UserSubscriptions />} />
        <Route path='/admins' element={<Admins />} />
        <Route path='/subscriptions' element={<Subscriptions />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
