import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormTemplate from "./template";
import api from "../../configs/api";

const AnimalForm = ({ initialData = null, onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [owners, setOwners] = useState([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await api.get("/owners/all");
        setOwners(response.data);
      } catch (error) {
        console.error("Error fetching owners:", error);
      } finally {
        setIsLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  const handleSubmit = async (data, setStatus) => {
    try {
      const selectedOwner = owners.find((owner) => owner.username === data.ownerId);
      const ownerId = selectedOwner?._id;

      const formattedData = {
        name: data.name,
        species: data.species,
        breed: data.breed,
        age: parseInt(data.age, 10) || null,
        weight: parseFloat(data.weight) || null,
        ownerId,
        lastVisit: data.lastVisit && isValidDate(data.lastVisit) ? new Date(data.lastVisit).toISOString() : null,
      };

      if (initialData) {
        await api.put(`/animals/${initialData._id}`, formattedData);
        setStatus({ message: t("animalForm.animalUpdatedSuccessfully"), type: "success" });
      } else {
        await api.post("/animals/add", formattedData);
        setStatus({ message: t("animalForm.animalAddedSuccessfully"), type: "success" });
      }

      setTimeout(() => {
        onSuccess();
        onBack();
      }, 1000);
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || t("animalForm.failedToSaveAnimal"),
        type: "error",
      });
    }
  };

  if (isLoadingOwners) {
    return <div>{t("animalForm.loadingOwners")}</div>;
  }

  const defaultOwnerUsername = initialData?.owner || "";

  return (
    <FormTemplate
      title={initialData ? t("animalForm.editAnimal") : t("animalForm.addNewAnimal")}
      buttonText={initialData ? t("animalForm.saveChanges") : t("animalForm.addAnimal")}
      onSubmit={handleSubmit}
      onBack={onBack}
      fields={[
        {
          name: "name",
          type: "text",
          label: t("animalForm.name"),
          defaultValue: initialData?.name || "",
          validation: { required: t("animalForm.nameRequired") },
          showLabel: true,
        },
        {
          name: "species",
          type: "text",
          label: t("animalForm.species"),
          defaultValue: initialData?.species || "",
          validation: { required: t("animalForm.speciesRequired") },
          showLabel: true,
        },
        {
          name: "breed",
          type: "text",
          label: t("animalForm.breed"),
          defaultValue: initialData?.breed || "",
          showLabel: true,
        },
        {
          name: "age",
          type: "number",
          label: t("animalForm.age"),
          defaultValue: initialData?.age || "",
          showLabel: true,
        },
        {
          name: "weight",
          type: "text",
          label: t("animalForm.weight"),
          defaultValue: initialData?.weight || "",
          validation: {
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: t("animalForm.weightPattern"),
            },
          },
          showLabel: true,
        },
        {
          name: "ownerId",
          type: "select",
          label: t("animalForm.owner"),
          defaultValue: defaultOwnerUsername,
          validation: { required: t("animalForm.ownerRequired") },
          showLabel: true,
          options: [
            ...owners.map((owner) => ({
              value: owner.username,
              label: owner.username,
            })),
          ],
        },
        {
          name: "lastVisit",
          type: "date",
          label: t("animalForm.lastVisit"),
          defaultValue: initialData?.lastVisit && isValidDate(initialData.lastVisit)
            ? new Date(initialData.lastVisit).toISOString().split("T")[0]
            : "",
          showLabel: true,
        },
      ]}
    />
  );
};

export default AnimalForm;