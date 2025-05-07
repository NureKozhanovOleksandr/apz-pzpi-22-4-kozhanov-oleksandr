import { useState } from "react";
import TablePage from "./tablePage";
import api from "../configs/api";
import Modal from "../components/modal";
import { useTranslation } from "react-i18next";
import AnimalForm from "../components/forms/animal";
import { useAuth } from '../contexts/authContext';

const Animals = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, animalId: null });
  const [addAnimalModal, setAddAnimalModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const { userData } = useAuth();

  const columnDefs = [
    { field: "name", headerName: t("animals.name") },
    { field: "species", headerName: t("animals.species") },
    { field: "breed", headerName: t("animals.breed") },
    { field: "age", headerName: t("animals.age") },
    { field: "weight", headerName: t("animals.weight") },
    { field: "owner", headerName: t("animals.owner") },
    { field: "lastVisit", headerName: t("animals.lastVisit") },
    { field: "code", headerName: t("animals.code") },
  ];

  if (userData?.role === 'vet') {
    columnDefs.push(
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
            {t("animals.edit")}
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
            onClick={() => setConfirmModal({ isOpen: true, animalId: params.data._id })}
          >
            {t("animals.deleteAnimal")}
          </button>
        ),
        width: 100,
        filter: false,
        cellStyle: { textAlign: "center" },
      }
    );
  }

  const handleDeleteAnimal = async (animalId) => {
    try {
      const response = await api.delete(`/animals/${animalId}`);
      if (response.status === 200) {
        setNotification({ isOpen: true, message: t("animals.animalDeleted") });
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting animal:", error);
      setNotification({ isOpen: true, message: t("notification.failedToDeleteAnimal") });
    } finally {
      setConfirmModal({ isOpen: false, animalId: null });
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
        apiEndpoint="/animals/all"
        columnDefs={columnDefs}
        transformData={(data) =>
          data.map((animal) => ({
            _id: animal._id,
            name: animal.name,
            species: animal.species,
            breed: animal.breed || t("animals.noBreed"),
            age: animal.age || t("animals.unknownAge"),
            weight: animal.weight || t("animals.unknownWeight"),
            owner: animal.ownerId.username,
            lastVisit: animal.lastVisit
              ? new Date(animal.lastVisit).toLocaleDateString()
              : t("animals.noVisit"),
            code: animal.code,
          }))
        }
        refreshKey={refreshKey}
        showActions={userData?.role === 'vet'}
        onAddClick={() => setAddAnimalModal(true)}
      />

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, animalId: null })}
        isDialog={true}
        onConfirm={() => handleDeleteAnimal(confirmModal.animalId)}
        confirmText={t("animals.confirm")}
        cancelText={t("animals.cancel")}
      >
        <p>{t("animals.deleteAnimalConfirmation")}</p>
      </Modal>

      <Modal
        isOpen={addAnimalModal}
        onClose={() => setAddAnimalModal(false)}
        isDialog={false}
      >
        <AnimalForm
          onBack={() => setAddAnimalModal(false)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      </Modal>

      <Modal
        isOpen={editModal}
        onClose={() => handleEditClose(false)}
        isDialog={false}
      >
        <AnimalForm
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

export default Animals;
