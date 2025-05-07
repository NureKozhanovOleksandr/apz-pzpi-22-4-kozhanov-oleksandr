import { useState } from "react";
import TablePage from "./tablePage";
import api from "../configs/api";
import Modal from "../components/modal";
import { useTranslation } from "react-i18next";

const HealthRecords = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, recordId: null });

  const columnDefs = [
    { field: "animal", headerName: t("healthRecords.animal") },
    { 
      field: "date", 
      headerName: t("healthRecords.date"), 
      valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
    { field: "temperature", headerName: t("healthRecords.temperature") },
    {
      field: "delete",
      headerName: "",
      cellRenderer: (params) => (
        <button
          className="row-btn delete"
          onClick={() => setConfirmModal({ isOpen: true, recordId: params.data._id })}
        >
          {t("healthRecords.deleteRecord")}
        </button>
      ),
      width: 100,
      filter: false,
      cellStyle: { textAlign: "center" },
    },
  ];

  const handleDeleteRecord = async (recordId) => {
    try {
      const response = await api.delete(`/healthrecords/${recordId}`);
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t("healthRecords.recordDeleted") });
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting health record:", error);
      setNotification({ isOpen: true, message: t("notification.failedToDeleteRecord") });
    } finally {
      setConfirmModal({ isOpen: false, recordId: null });
    }
  };

  return (
    <>
      <TablePage
        apiEndpoint="/healthrecords/all"
        columnDefs={columnDefs}
        transformData={(data) =>
          data.map((record) => ({
            _id: record._id,
            animal: record.animalName,
            date: record.date,
            temperature: record.temperature || t("healthRecords.noTemperature"),
          }))
        }
        refreshKey={refreshKey}
      />
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, recordId: null })}
        isDialog={true}
        confirmText={t("healthRecords.confirm")}
        cancelText={t("healthRecords.cancel")}
        onConfirm={() => handleDeleteRecord(confirmModal.recordId)}
      >
        <p>{t("healthRecords.deleteRecordConfirmation")}</p>
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

export default HealthRecords;