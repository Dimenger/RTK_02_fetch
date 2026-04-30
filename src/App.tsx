import { useEffect, useRef, useState } from "react";
import "./App.css";
import { UserCard } from "./entities/user";
import { addUser, deleteUser, getUsers, updateUser } from "./entities/user/api";
import { AddUserForm } from "./features/add-user";
import { DeleteUserModal } from "./features/delete-user";
import type { UserFormData, UserType } from "./shared/types";
import { INITIAL_USER_FORM } from "./shared/types";

function App() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userForm, setUserForm] = useState<UserFormData>(INITIAL_USER_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const controllersRef = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    const controller = new AbortController();

    const getData = async () => {
      try {
        setIsLoading(true);
        const getUserList = await getUsers(controller.signal);
        setUsers(getUserList);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        } else {
          setError(
            err instanceof Error
              ? `Ошибка загрузки: ${err.message}`
              : "Ошибка загрузки данных.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };
    getData();
    return () => controller.abort();
  }, []);

  const removeUser = async (id: string) => {
    if (controllersRef.current[id]) controllersRef.current[id].abort();
    const controller = new AbortController();
    controllersRef.current[id] = controller;

    try {
      setIsDeleting(true);
      setError("");
      await deleteUser(id, controller.signal);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setUserToDelete(null);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Запрос был отменен");
      } else {
        setError(
          error instanceof Error
            ? `Ошибка удаления: ${error.message}`
            : "Ошибка удаления пользователя.",
        );
      }
    } finally {
      delete controllersRef.current[id];
      setIsDeleting(false);
    }
  };

  const onToggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user,
      ),
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    const finalValue =
      type === "number"
        ? Number(value)
        : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value;

    setUserForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Определяем ID: для редактирования берем старый, для нового — генерим временный
    const currentId = editingId || crypto.randomUUID();
    const controller = new AbortController();
    controllersRef.current[currentId] = controller;

    try {
      setIsSubmitting(true);
      setError("");

      if (editingId) {
        const response = await updateUser(
          editingId,
          userForm,
          controller.signal,
        );

        if (response.success && response.data) {
          const updatedUser = response.data;

          setUsers((prev) =>
            prev.map((user) => (user.id === editingId ? updatedUser : user)),
          );
          setEditingId(null);
        }
      } else {
        const newUser: UserType = {
          ...userForm,
          id: currentId,
        };

        const response = await addUser(newUser, controller.signal);
        setUsers((prev) => [...prev, (response.data ?? newUser) as UserType]);
      }

      setUserForm(INITIAL_USER_FORM);
      setIsAddFormVisible(false);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Запрос был отменен");
      } else {
        setError(
          error instanceof Error
            ? `Ошибка сохранения: ${error.message}`
            : "Ошибка сохранения пользователя.",
        );
      }
    } finally {
      delete controllersRef.current[currentId];
      setIsSubmitting(false);
    }
  };

  const editUser = (id: string) => {
    const selectedUser = users.find((user) => user.id === id);
    if (!selectedUser) return;

    setUserForm({
      name: selectedUser.name,
      email: selectedUser.email,
      age: selectedUser.age,
      city: selectedUser.city,
      role: selectedUser.role,
      isActive: selectedUser.isActive,
      score: selectedUser.score,
    });
    setEditingId(id);
    setIsAddFormVisible(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUserForm(INITIAL_USER_FORM);
  };

  const showAddForm = () => {
    setIsAddFormVisible(true);
    setEditingId(null);
    setUserForm(INITIAL_USER_FORM);
  };

  const hideAddForm = () => {
    setIsAddFormVisible(false);
    setUserForm(INITIAL_USER_FORM);
  };

  const openDeleteModal = (user: UserType) => {
    setUserToDelete(user);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setUserToDelete(null);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    void removeUser(userToDelete.id);
  };

  if (isLoading) return <div style={{ color: "green" }}>...Loading</div>;

  return (
    <div>
      <h2>Start to Fetch</h2>
      {error ? (
        <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>
      ) : null}

      <button onClick={showAddForm} className="addUserBtn">
        ➕ Добавить пользователя
      </button>

      <AddUserForm
        userForm={userForm}
        isVisible={isAddFormVisible}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onCancel={hideAddForm}
        isSubmitting={isSubmitting}
      />

      <div>
        {users.map((user) => (
          <UserCard
            key={user.id}
            userInfo={user.id === editingId ? { ...user, ...userForm } : user}
            isEditing={user.id === editingId}
            handleChange={handleChange}
            removeUser={() => openDeleteModal(user)}
            editUser={() => editUser(user.id)}
            saveUser={handleSubmit}
            cancelEdit={cancelEdit}
            onToggleActive={() => onToggleActive(user.id)}
          />
        ))}
      </div>
      <DeleteUserModal
        isOpen={Boolean(userToDelete)}
        userName={userToDelete?.name ?? ""}
        isDeleting={isDeleting}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default App;
