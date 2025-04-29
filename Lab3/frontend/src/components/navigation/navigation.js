import './navigation.css';
import logo from './logo.png';
import { MdLogout, MdPayment } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { GrUserAdmin } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/authContext';
import LanguageSwitcher from '../languageSwitcher';
import Modal from '../modal';
import api from '../../configs/api';
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

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

  const onSubmit = async (data) => {
    try {
      const response = await api.put('/update_password', {
        old_password: data.oldPassword,
        new_password: data.newPassword,
      });
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t("notification.passwordUpdated") });
        setTimeout(() => {
          toggleAccordion();
          reset();
        }, 700);
      }
    } catch (error) {
      setNotification({ isOpen: true, message: t("notification.passwordUpdateFailed") });
    }
  };

  const getActiveLink = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const getPageTitle = () => {
    if (userEmail) {
      return userEmail;
    }
    if (getActiveLink('/customers') === 'active') return t('navigation.customers');
    if (getActiveLink('/admins') === 'active') return t('navigation.admins');
    if (getActiveLink('/subscriptions') === 'active') return t('navigation.subscriptions');
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
              {!userEmail ? (
                <FiUsers className='icon' />
              ) : (
                <IoArrowBackOutline className='icon arrow' />
              )}
              {t('navigation.vets')}
            </Link>
            {userEmail && (
              <div className="user-email">
                <FaRegUser className='icon' />
                {userEmail}
              </div>
            )}
          </div>
          <div className={`link-container ${getActiveLink('/admins')}`}>
            <Link to="/admins" className="link" onClick={handleLinkClick}>
              <GrUserAdmin className='icon' />
              {t('navigation.admins')}
            </Link>
          </div>
          <div className={`link-container ${getActiveLink('/subscriptions')}`}>
            <Link to="/subscriptions" className="link" onClick={handleLinkClick}>
              <MdPayment className='icon' />
              {t('navigation.subscriptions')}
            </Link>
          </div>
        </div>
        <div className='user-panel'>
          <div className='user-header'>
            <p className='name'>{userData?.name || ''}</p>
            <p className='email'>{userData?.email || ''}</p>
            <IoIosArrowDown
              className={`icon ${isAccordionOpen ? 'open' : ''}`}
              onClick={toggleAccordion}
            />
            {isAccordionOpen && (
              <div className='accordion-content'>
                <form className='form' onSubmit={handleSubmit(onSubmit)}>
                  <div className='form-group'>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      {...register('oldPassword', {
                        required: t('login.passwordRequired'),
                        minLength: { value: 8, message: t('login.passwordMinLength', { length: 8 }) },
                      })}
                      placeholder={t('navigation.oldPassword')}
                    />
                    <button
                      type="button"
                      className="icon"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.oldPassword && <p className="error">{errors.oldPassword.message}</p>}
                  <div className='form-group'>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...register('newPassword', {
                        required: t('login.passwordRequired'),
                        minLength: { value: 8, message: t('login.passwordMinLength', { length: 8 }) },
                      })}
                      placeholder={t('navigation.newPassword')}
                    />
                    <button
                      type="button"
                      className="icon"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}
                  <button type='submit'>{t('navigation.changePassword')}</button>
                </form>
                <LanguageSwitcher changeLanguage={changeLanguage} />
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