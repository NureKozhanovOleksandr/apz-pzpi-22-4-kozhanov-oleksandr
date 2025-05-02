import FormTemplate from "./template";
import { useTranslation } from "react-i18next";
import api from "../../configs/api";

const VetForm = ({ initialData, onBack, onSuccess }) => {
  const { t } = useTranslation();

  const handleSubmit = async (data, setStatus) => {
    try {
      const formattedData = {
        email: data.email,
        specialization: data.specialization,
        contactInfo: data.contactInfo,
      };

      if (!initialData) {
        formattedData.username = data.username;
        formattedData.password = data.password;
        await api.post("/vets/add", formattedData);
        setStatus({ message: t("vetForm.vetAddedSuccessfully"), type: "success" });
      } else {
        await api.put(`/vets/${initialData.id}`, formattedData);
        setStatus({ message: t("vetForm.vetUpdatedSuccessfully"), type: "success" });
      }

      setTimeout(() => {
        onSuccess();
        onBack();
      }, 1000);
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || t("vetForm.failedToSaveVet"),
        type: "error",
      });
    }
  };

  return (
    <FormTemplate
      title={initialData ? t("vetForm.editVet") : t("vetForm.addNewVet")}
      buttonText={initialData ? t("vetForm.saveChanges") : t("vetForm.addVet")}
      onSubmit={handleSubmit}
      onBack={onBack}
      fields={[
        ...(initialData
          ? []
          : [
            {
              name: "username",
              type: "text",
              label: t("vetForm.username"),
              defaultValue: "",
              validation: { required: t("vetForm.usernameRequired") },
              showLabel: true,
            },
            {
              name: "password",
              type: "password",
              label: t("vetForm.password"),
              placeholder: t("vetForm.passwordPlaceholder"),
              validation: {
                required: t("vetForm.passwordRequired"),
                minLength: { value: 8, message: t("vetForm.passwordMinLength") },
              },
              showLabel: true,
            },
          ]),
        {
          name: "email",
          type: "email",
          label: t("vetForm.email"),
          defaultValue: initialData?.email || "",
          validation: {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("vetForm.invalidEmail"),
            },
          },
          showLabel: true,
        },
        {
          name: "specialization",
          type: "text",
          label: t("vetForm.specialization"),
          defaultValue: initialData?.specialization || "",
          validation: {},
          showLabel: true,
        },
        {
          name: "contactInfo",
          type: "text",
          label: t("vetForm.contactInfo"),
          defaultValue: initialData?.contactInfo || "",
          validation: {},
          showLabel: true,
        },
      ]}
    />
  );
};

export default VetForm;