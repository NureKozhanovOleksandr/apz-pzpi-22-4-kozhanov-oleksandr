import { useTranslation } from "react-i18next";
import FormTemplate from "./template";
import api from "../../configs/api";

const EditOwnerForm = ({ initialData, onBack, onSuccess }) => {
  const { t } = useTranslation();

  const handleSubmit = async (data, setStatus) => {
    try {
      const formattedData = {
        username: data.username,
        email: data.email,
        address: data.address
      }

      await api.put(`/owners/${initialData._id}`, formattedData);
      setStatus({ message: t("editOwnerForm.ownerUpdatedSuccessfully"), type: "success" });

      setTimeout(() => {
        onSuccess();
        onBack();
      }, 1000);
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || t("editOwnerForm.failedToSaveOwner"),
        type: "error",
      });
    }
  };

  return (
    <FormTemplate
      title={t("editOwnerForm.editOwner")}
      buttonText={t("editOwnerForm.saveChanges")}
      onSubmit={handleSubmit}
      onBack={onBack}
      fields={[
        {
          name: "username",
          type: "text",
          label: t("editOwnerForm.username"),
          defaultValue: initialData.username,
          validation: { required: t("editOwnerForm.usernameRequired") },
          showLabel: true,
        },
        {
          name: "email",
          type: "email",
          label: t("editOwnerForm.email"),
          defaultValue: initialData.email,
          validation: {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("editOwnerForm.invalidEmail"),
            },
          },
          showLabel: true,
        },
        {
          name: "address",
          type: "text",
          label: t("editOwnerForm.address"),
          defaultValue: initialData.address,
          showLabel: true,
        },
      ]}
    />
  );
};

export default EditOwnerForm;
