import './App.css';
import Navigation from './components/navigation/navigation';
import NotFound from './pages/notFound/notFound';
import Vets from './pages/vets';
import Animals from './pages/animals';
import Appointments from './pages/appointments';
import Owners from './pages/owners';
import HealthRecords from './pages/healthRecords';
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
        <Route path='/vets' element={<Vets />} />        
        <Route path='/animals' element={<Animals />} />
        <Route path='/appointments' element={<Appointments />} />
        <Route path='/owners' element={<Owners />} />
        <Route path='/health-records' element={<HealthRecords />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
