import { useState } from "react";
import TablePage from "./tablePage";
import api from "../configs/api";
import Modal from "../components/modal";
import { useTranslation } from "react-i18next";
import AppointmentForm from "../components/forms/appointment";

const Appointments = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, appointmentId: null });
  const [addAppointmentModal, setAddAppointmentModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const columnDefs = [
    { field: "animal", headerName: t("appointments.animal") },
    { field: "vet", headerName: t("appointments.vet") },
    { field: "date", headerName: t("appointments.date") },
    { field: "reason", headerName: t("appointments.reason") },
    { field: "diagnosis", headerName: t("appointments.diagnosis") },
    { field: "treatment", headerName: t("appointments.treatment") },
    { field: "notes", headerName: t("appointments.notes") },
    { field: "status", headerName: t("appointments.status") },
    {
      field: "edit",
      headerName: "",
      cellRenderer: (params) => (
        <button
          className="row-btn edit"
          onClick={() => {
            setEditData(params.data);
            setEditModal(true);
          }}
        >
          {t("appointments.edit")}
        </button>
      ),
      width: 100,
      filter: false,
      cellStyle: { textAlign: "center" },
    },
    {
      field: "delete",
      headerName: "",
      cellRenderer: (params) => (
        <button
          className="row-btn delete"
          onClick={() => setConfirmModal({ isOpen: true, appointmentId: params.data._id })}
        >
          {t("appointments.deleteAppointment")}
        </button>
      ),
      width: 100,
      filter: false,
      cellStyle: { textAlign: "center" },
    },
  ];

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t("appointments.appointmentDeleted") });
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setNotification({ isOpen: true, message: t("notification.failedToDeleteAppointment") });
    } finally {
      setConfirmModal({ isOpen: false, appointmentId: null });
    }
  };

  const handleEditClose = (shouldRefresh = false) => {
    setEditModal(false);
    setEditData(null);
    if (shouldRefresh) {
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <>
      <TablePage
        apiEndpoint="/appointments/all"
        columnDefs={columnDefs}
        transformData={(data) =>
          data.map((appointment) => ({
            _id: appointment._id,
            animal: appointment.animalName,
            vet: appointment.vetName,
            date: new Date(appointment.date).toLocaleDateString(),
            reason: appointment.reason,
            diagnosis: appointment.diagnosis || t("appointments.noDiagnosis"),
            treatment: appointment.treatment || t("appointments.noTreatment"),
            notes: appointment.notes || t("appointments.noNotes"),
            status: appointment.status,
          }))
        }
        refreshKey={refreshKey}
        showActions={true}
        onAddClick={() => setAddAppointmentModal(true)}
      />
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, appointmentId: null })}
        isDialog={true}
        onConfirm={() => handleDeleteAppointment(confirmModal.appointmentId)}
        confirmText={t("appointments.confirm")}
        cancelText={t("appointments.cancel")}
      >
        <p>{t("appointments.deleteAppointmentConfirmation")}</p>
      </Modal>
      <Modal
        isOpen={addAppointmentModal}
        onClose={() => setAddAppointmentModal(false)}
        isDialog={false}
      >
        <AppointmentForm
          onBack={() => setAddAppointmentModal(false)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => handleEditClose(false)}
        isDialog={false}
      >
        <AppointmentForm
          initialData={editData}
          onBack={() => handleEditClose(false)}
          onSuccess={() => handleEditClose(true)}
        />
      </Modal>
      <Modal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ isOpen: false, message: "" })}
        message={notification.message}
        showCloseButton={true}
      />
    </>
  );
};

export default Appointments;