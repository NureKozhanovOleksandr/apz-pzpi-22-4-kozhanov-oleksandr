import { useState } from "react";
import TablePage from "./tablePage";
import api from "../configs/api";
import Modal from "../components/modal";
import VetForm from "../components/forms/vet";
import { useTranslation } from "react-i18next";

const Vets = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, vetId: null });
  const [addVetModal, setAddVetModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const columnDefs = [
    { field: "username", headerName: t("vets.username") },
    { field: "specialization", headerName: t("vets.specialization") },
    { field: "contactInfo", headerName: t("vets.contactInfo") },
    { field: "email", headerName: t("vets.email") },
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
          {t("vets.edit")}
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
          onClick={() => setConfirmModal({ isOpen: true, vetId: params.data.id })}
        >
          {t("vets.deleteVet")}
        </button>
      ),
      width: 100,
      filter: false,
      cellStyle: { textAlign: "center" },
    },
  ];

  const handleDeleteVet = async (vetId) => {
    try {
      const response = await api.delete(`/vets/${vetId}`);
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t("vets.vetDeleted") });
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting vet:", error);
      setNotification({ isOpen: true, message: t("notification.failedToDeleteVet") });
    } finally {
      setConfirmModal({ isOpen: false, vetId: null });
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
        apiEndpoint="/vets/all"
        columnDefs={columnDefs}
        transformData={(data) =>
          data.map((vet) => ({
            id: vet._id,
            username: vet.username,
            specialization: vet.vetData.specialization,
            contactInfo: vet.vetData.contactInfo,
            email: vet.email,
          }))
        }
        refreshKey={refreshKey}
        showActions={true}
        onAddClick={() => setAddVetModal(true)}
      />
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, vetId: null })}
        isDialog={true}
        onConfirm={() => handleDeleteVet(confirmModal.vetId)}
        confirmText={t("vets.confirm")}
        cancelText={t("vets.cancel")}
      >
        <p>{t("vets.deleteVetConfirmation")}</p>
      </Modal>
      <Modal
        isOpen={addVetModal}
        onClose={() => setAddVetModal(false)}
        isDialog={false}
      >
        <VetForm
          onBack={() => setAddVetModal(false)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => handleEditClose(false)}
        isDialog={false}
      >
        <VetForm
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

export default Vets;