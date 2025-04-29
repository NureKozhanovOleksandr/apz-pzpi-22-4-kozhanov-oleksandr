import './notFound.css';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className='page not-found'>
      <p>{t("notFound.title")}</p>      
    </div>
  );
};

export default NotFound;