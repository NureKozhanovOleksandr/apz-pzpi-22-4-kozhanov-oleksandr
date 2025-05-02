import React from "react";
import FormTemplate from "./template";
import { useTranslation } from "react-i18next";
import api from "../../configs/api";

const NewOwnerForm = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();

  const handleAddOwner = async (data, setStatus) => {
    try {
      const response = await api.post("/owners/add", data);
      if (response.status === 201) {
        setStatus({ message: t("owners.ownerAdded"), type: "success" });
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || t("owners.failedToAddOwner"),
        type: "error",
      });
    }
  };

  return (
    <FormTemplate
      title={t("owners.addOwner")}
      buttonText={t("owners.add")}
      onSubmit={handleAddOwner}
      onBack={onClose}
      fields={[
        {
          name: "username",
          type: "text",
          placeholder: t("owners.usernamePlaceholder"),
          validation: { required: t("owners.usernameRequired") },
        },
        {
          name: "email",
          type: "email",
          placeholder: t("owners.emailPlaceholder"),
          validation: {},
        },
        {
          name: "password",
          type: "password",
          placeholder: t("owners.passwordPlaceholder"),
          validation: {
            required: t("owners.passwordRequired"),
            minLength: { value: 8, message: t("owners.passwordMinLength") },
          },
        },
        {
          name: "address",
          type: "text",
          placeholder: t("owners.addressPlaceholder"),
          validation: { required: t("owners.addressRequired") },
        },
      ]}
    />
  );
};

export default NewOwnerForm;
