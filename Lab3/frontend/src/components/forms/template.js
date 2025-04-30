import './template.css';
import { IoArrowBackOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { FiEye, FiEyeOff } from "react-icons/fi";
import LanguageSwitcher from "../languageSwitcher";

const FormTemplate = ({
  title,
  fields,
  onSubmit,
  buttonText,
  isLogin = false,
  className,
  onForgotPassword,
  onBack,
  changeLanguage = null
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ message: null, type: null });

  useEffect(() => {
    const defaultValues = {};
    fields.forEach(({ name, defaultValue }) => {
      if (defaultValue !== undefined) {
        defaultValues[name] = defaultValue;
      }
    });
    reset(defaultValues);
  }, [fields, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data, setStatus);
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || t("error.generic"),
        type: "error",
      });
    }
  };

  return (
    <div className={`form-template ${className}`}>
      <div className='header'>
        {changeLanguage && <LanguageSwitcher changeLanguage={changeLanguage} />}
        <div className='title'>
          <IoArrowBackOutline className='icon' onClick={onBack} />
          {title}
        </div>
      </div>
      {status.message && <div className={`status ${status.type}`}>{status.message}</div>}
      <form className='form' onSubmit={handleSubmit(handleFormSubmit)}>
        {fields.map(({ name, type, label, validation, showLabel = false, placeholder, options }) => (
          <div className="form-group" key={name}>
            {showLabel && <label htmlFor={name}>{label}</label>}
            {type === "select" ? (
              <select
                id={name}
                {...register(name, validation)}
                defaultValue=""
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={name}
                type={name === "password" && showPassword ? "text" : type}
                {...register(name, validation)}
                autoComplete={name === "password" ? "new-password" : "off"}
                placeholder={!showLabel ? placeholder : undefined}
              />
            )}
            {errors[name] && <p className="error">{errors[name].message}</p>}
            {name === "password" && (
              showPassword ? (
                <FiEyeOff className="icon" onClick={() => setShowPassword(false)} />
              ) : (
                <FiEye className="icon" onClick={() => setShowPassword(true)} />
              )
            )}
          </div>
        ))}
        {isLogin && (
          <div className='additional'>
            <span className='forgot' onClick={onForgotPassword}>{t("login.forgotPassword")}</span>
          </div>
        )}
        <button type='submit'>{buttonText}</button>
      </form>
    </div>
  );
};

export default FormTemplate;
