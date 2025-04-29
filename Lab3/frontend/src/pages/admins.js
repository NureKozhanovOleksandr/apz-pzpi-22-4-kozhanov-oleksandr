import { useState } from "react";
import TablePage from "./tablePage";
import RegisterForm from "../components/forms/register";
import Modal from "../components/modal";
import { useTranslation } from "react-i18next";

const Admins = () => {
  const { t } = useTranslation();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const columnDefs = [
    { field: "name", headerName: t("admins.name") },
    { field: "email", headerName: t("admins.email") },
    { field: "createdAt", headerName: t("admins.createdAt") },
  ];

  const transformData = (data) =>
    data.admins.map((admin) => ({
      ...admin,
      name: admin.name,
      email: admin.email,
      createdAt: new Date(admin.created_at).toLocaleDateString(),
    }));

  const handleModalClose = (shouldRefresh = false) => {
    setModalIsOpen(false);
    if (shouldRefresh) {
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <>
      <TablePage
        apiEndpoint="/admin/admins"
        columnDefs={columnDefs}
        transformData={transformData}
        showActions={true}
        onAddClick={() => setModalIsOpen(true)}
        refreshKey={refreshKey}
      />
      {modalIsOpen && (
        <Modal isOpen={modalIsOpen} onClose={() => handleModalClose(false)}>
          <RegisterForm
            onBack={() => handleModalClose(false)}
            onSuccess={() => handleModalClose(true)}
          />
        </Modal>
      )}
    </>
  );
};

export default Admins;
