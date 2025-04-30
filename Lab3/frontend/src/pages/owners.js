import { useState } from "react";
import TablePage from "./tablePage";
import api from "../configs/api";
import Modal from "../components/modal";
import { useTranslation } from "react-i18next";
import NewOwnerForm from "../components/forms/newOwner";
import EditOwnerForm from "../components/forms/editOwner";

const Owners = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, ownerId: null });
  const [addOwnerModal, setAddOwnerModal] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const columnDefs = [
    { field: "username", headerName: t("owners.username") },
    { field: "email", headerName: t("owners.email") },
    { field: "address", headerName: t("owners.address") },
    { field: "animals", headerName: t("owners.animals") },
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
          {t("owners.edit")}
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
          onClick={() => setConfirmModal({ isOpen: true, ownerId: params.data._id })}
        >
          {t("owners.deleteOwner")}
        </button>
      ),
      width: 100,
      filter: false,
      cellStyle: { textAlign: "center" },
    },
  ];

  const handleDeleteOwner = async (ownerId) => {
    try {
      const response = await api.delete(`/owners/${ownerId}`);
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t("owners.ownerDeleted") });
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting owner:", error);
      setNotification({ isOpen: true, message: t("notification.failedToDeleteOwner") });
    } finally {
      setConfirmModal({ isOpen: false, ownerId: null });
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
        apiEndpoint="/owners/all"
        columnDefs={columnDefs}
        transformData={(data) =>
          data.map((owner) => ({
            _id: owner._id,
            username: owner.username,
            email: owner.email || t("owners.noEmail"),
            address: owner.ownerData?.address || t("owners.noAddress"),
            animals: owner.ownerData?.animals?.join(", ") || t("owners.noAnimals"),
          }))
        }
        refreshKey={refreshKey}
        showActions={true}
        onAddClick={() => setAddOwnerModal(true)}
      />

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, ownerId: null })}
        isDialog={true}
        onConfirm={() => handleDeleteOwner(confirmModal.ownerId)}
        confirmText={t("owners.confirm")}
        cancelText={t("owners.cancel")}
      >
        <p>{t("owners.deleteOwnerConfirmation")}</p>
      </Modal>

      <Modal
        isOpen={addOwnerModal}
        onClose={() => setAddOwnerModal(false)}
        isDialog={false}
      >
        <NewOwnerForm
          onClose={() => setAddOwnerModal(false)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      </Modal>

      <Modal
        isOpen={editModal}
        onClose={() => handleEditClose(false)}
        isDialog={false}
      >
        <EditOwnerForm
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

export default Owners;