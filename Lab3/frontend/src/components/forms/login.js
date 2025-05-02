import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormTemplate from "./template";
import { ResetPasswordForm } from "./resetPassword";
import api from "../../configs/api";
import { useAuth } from "../../contexts/authContext";

export const LoginForm = ({ changeLanguage }) => {
  const { login } = useAuth();
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (data, setStatus) => {
    try {
      const response = await api.post('/auth/login', data);
      if (response.status === 200) {
        localStorage.setItem('accessToken', response.data.token);
        setStatus({ message: t("login.success"), type: "success" });
        setTimeout(() => {
          login();
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setStatus({
        message: error.response?.data?.message || t("login.failed"),
        type: "error",
      });
    }
  };

  return isResetPassword ? (
    <ResetPasswordForm changeLanguage={changeLanguage} onBack={() => setIsResetPassword(false)} />
  ) : (
    <FormTemplate
      title={t("login.title")}
      buttonText={t("login.buttonText")}
      onSubmit={handleLogin}
      fields={[
        {
          name: "username",
          type: "text",
          placeholder: t("login.emailPlaceholder"),
          validation: { required: t("login.emailRequired") },
        },
        {
          name: "password",
          type: "password",
          placeholder: t("login.passwordPlaceholder"),
          validation: {
            required: t("login.passwordRequired"),
            minLength: { value: 8, message: t("login.passwordMinLength") },
          },
        },
      ]}
      isLogin={true}
      className={"login-form"}
      onForgotPassword={() => setIsResetPassword(true)}
      changeLanguage={changeLanguage}
    />
  );
};
