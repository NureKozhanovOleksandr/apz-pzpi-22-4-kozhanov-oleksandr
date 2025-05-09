import './navigation.css';
import logo from './logo.png';
import { MdLogout } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/authContext';
import LanguageSwitcher from '../languageSwitcher';
import { IoIosPerson } from "react-icons/io";
import { RiHealthBookLine } from "react-icons/ri";
import { FaDog } from "react-icons/fa6";
import { MdOutlineAssignment } from "react-icons/md";
import Modal from '../modal';
import api from '../../configs/api';
import BackupManager from './backup';

const Navigation = ({ changeLanguage }) => {
  const { t, i18n } = useTranslation();
  const { logout, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation();
  const userId = location.pathname.split('/')[3];
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });

  useEffect(() => {
    if (i18n.isInitialized) {
      setLoading(false);
    } else {
      const handleInitialized = () => setLoading(false);
      i18n.on('initialized', handleInitialized);
      return () => i18n.off('initialized', handleInitialized);
    }
  }, [i18n]);

  useEffect(() => {
    if (!location.pathname.startsWith("/customers/user")) {
      setUserEmail(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await api.get(`/admin/user/user?user=${userId}`);
        if (response.data && response.data.user.email) {
          setUserEmail(response.data.user.email);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (userId) {
      fetchUserEmail();
    }
  }, [userId]);

  const handleLogout = () => {
    logout();
  };

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getActiveLink = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const getPageTitle = () => {
    if (userEmail) {
      return userEmail;
    }

    if (getActiveLink('/vets') === 'active') return t('navigation.vets');
    if (getActiveLink('/animals') === 'active') return t('navigation.animals');
    if (getActiveLink('/appointments') === 'active') return t('navigation.appointments');
    if (getActiveLink('/owners') === 'active') return t('navigation.owners');
    if (getActiveLink('/health-records') === 'active') return t('navigation.healthRecords');

    return 'vet clinic';
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      toggleMenu();
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className={`navigation ${isMenuOpen ? 'expanded' : ''}`}>
      <div className='logo'>
        <RxHamburgerMenu className="burger-menu-icon" onClick={toggleMenu} />
        <img src={logo} alt='company-logo' className="desktop-logo" />
        <span className="desktop-text">vet clinic</span>
        <span className="mobile-title">{getPageTitle()}</span>
      </div>
      <div className='navigation-container'>
        <div className='links'>
          <div className={`link-container ${getActiveLink('/vets')}`}>
            <Link to="/vets" className="link" onClick={handleLinkClick}>
              <FaUserDoctor className='icon' />
              {t('navigation.vets')}
            </Link>
          </div>
          <div className={`link-container ${getActiveLink('/animals')}`}>
            <Link to="/animals" className="link" onClick={handleLinkClick}>
              <FaDog className='icon' />
              {t('navigation.animals')}
            </Link>
          </div>
          <div className={`link-container ${getActiveLink('/appointments')}`}>
            <Link to="/appointments" className="link" onClick={handleLinkClick}>
              <MdOutlineAssignment className='icon' />
              {t('navigation.appointments')}
            </Link>
          </div>
          <div className={`link-container ${getActiveLink('/owners')}`}>
            <Link to="/owners" className="link" onClick={handleLinkClick}>
              <IoIosPerson className='icon' />
              {t('navigation.owners')}
            </Link>
          </div>
          <div className={`link-container ${getActiveLink('/health-records')}`}>
            <Link to="/health-records" className="link" onClick={handleLinkClick}>
              <RiHealthBookLine className='icon' />
              {t('navigation.healthRecords')}
            </Link>
          </div>
        </div>
        <div className='user-panel'>
          <div className='user-header'>
            <p className='name'>{userData?.username || ''}</p>
            <p className='email'>{userData?.email || ''}</p>
            <IoIosArrowDown
              className={`icon ${isAccordionOpen ? 'open' : ''}`}
              onClick={toggleAccordion}
            />
            {isAccordionOpen && (
              <div className='accordion-content'>
                {userData?.role === 'admin' && <BackupManager />}
                <div className={userData?.role === 'vet' ? 'margin' : ''}>
                  <LanguageSwitcher changeLanguage={changeLanguage} />
                </div>
              </div>
            )}
          </div>
          <button className='logout' onClick={handleLogout}>
            <MdLogout className='icon' />
            <span>{t('navigation.logout')}</span>
          </button>
        </div>
      </div>
      <Modal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ isOpen: false, message: "" })}
        message={notification.message}
        showCloseButton={true}
      />
    </div>
  );
};

export default Navigation;