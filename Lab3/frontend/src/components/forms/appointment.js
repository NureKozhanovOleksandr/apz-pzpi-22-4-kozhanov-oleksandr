import React, { useState, useEffect } from "react";
import FormTemplate from "./template";
import { useTranslation } from "react-i18next";
import api from "../../configs/api";

const AppointmentForm = ({ initialData = null, onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [animals, setAnimals] = useState([]);
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animalsResponse, vetsResponse] = await Promise.all([
          api.get("/animals/all"),
          api.get("/vets/all"),
        ]);
        setAnimals(animalsResponse.data);
        setVets(vetsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (data, setStatus) => {
    try {
      const formattedData = {
        animalId: initialData ? initialData.animalId : data.animalId,
        vetId: initialData ? initialData.vetId : data.vetId,
        date: new Date(data.date),
        reason: data.reason,
        diagnosis: data.diagnosis || "",
        treatment: data.treatment || "",
        notes: data.notes || "",
        status: data.status,
      };

      if (initialData) {
        await api.put(`/appointments/${initialData._id}`, formattedData);
        setStatus({ message: t("appointmentForm.updatedSuccessfully"), type: "success" });
      } else {
        await api.post("/appointments/add", formattedData);
        setStatus({ message: t("appointmentForm.addedSuccessfully"), type: "success" });
      }

      setTimeout(() => {
        onSuccess();
        onBack();
      }, 1000);
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || t("appointmentForm.failedToSave"),
        type: "error",
      });
    }
  };

  if (isLoading) {
    return <div>{t("appointmentForm.loadingData")}</div>;
  }

  const fields = [
    ...(initialData
      ? []
      : [
          {
            name: "animalId",
            type: "select",
            label: t("appointmentForm.animal"),
            defaultValue: initialData?.animalId || "",
            validation: { required: t("appointmentForm.animalRequired") },
            showLabel: true,
            options: animals.map((animal) => ({
              value: animal._id,
              label: animal.name,
            })),
          },
          {
            name: "vetId",
            type: "select",
            label: t("appointmentForm.vet"),
            defaultValue: initialData?.vetId || "",
            validation: { required: t("appointmentForm.vetRequired") },
            showLabel: true,
            options: vets.map((vet) => ({
              value: vet._id,
              label: vet.username,
            })),
          },
          {
            name: "date",
            type: "datetime-local",
            label: t("appointmentForm.date"),
            defaultValue: initialData?.date
              ? new Date(initialData.date).toISOString().slice(0, 16)
              : "",
            validation: { required: t("appointmentForm.dateRequired") },
            showLabel: true,
          },
        ]),
    {
      name: "reason",
      type: "text",
      label: t("appointmentForm.reason"),
      defaultValue: initialData?.reason || "",
      validation: { required: t("appointmentForm.reasonRequired") },
      showLabel: true,
    },
    {
      name: "diagnosis",
      type: "text",
      label: t("appointmentForm.diagnosis"),
      defaultValue: initialData?.diagnosis || "",
      showLabel: true,
    },
    {
      name: "treatment",
      type: "text",
      label: t("appointmentForm.treatment"),
      defaultValue: initialData?.treatment || "",
      showLabel: true,
    },
    {
      name: "notes",
      type: "textarea",
      label: t("appointmentForm.notes"),
      defaultValue: initialData?.notes || "",
      showLabel: true,
    },
    {
      name: "status",
      type: "text",
      label: t("appointmentForm.status"),
      defaultValue: initialData?.status || "",
      validation: { required: t("appointmentForm.statusRequired") },
      showLabel: true,
    },
  ];

  return (
    <FormTemplate
      title={initialData ? t("appointmentForm.editAppointment") : t("appointmentForm.addNewAppointment")}
      buttonText={initialData ? t("appointmentForm.saveChanges") : t("appointmentForm.addAppointment")}
      onSubmit={handleSubmit}
      onBack={onBack}
      fields={fields}
    />
  );
};

export default AppointmentForm;