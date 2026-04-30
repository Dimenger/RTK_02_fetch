import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import "./App.css";
import { UserCard } from "./entities/user";
import { addUser, getUsers } from "./entities/user/api";
import { AddUserForm } from "./features/add-user";
import type { UserFormData, UserType } from "./shared/types";
import { INITIAL_USER_FORM } from "./shared/types";

function App() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userForm, setUserForm] = useState<UserFormData>(INITIAL_USER_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

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
          setError(err instanceof Error ? err.message : "Error");
        }
      } finally {
        setIsLoading(false);
      }
    };
    getData();
    return () => controller.abort();
  }, []);

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const onToggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user,
      ),
    );
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === "number"
        ? Number(value)
        : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value;

    if (editingId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingId ? { ...user, [name]: finalValue } : user,
        ),
      );
    } else {
      setUserForm((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId) {
      setEditingId(null);
    } else {
      const newUser: UserType = {
        ...userForm,
        id: crypto.randomUUID(),
      };
      const controller = new AbortController();
      controllersRef.current[newUser.id] = controller;
      try {
        setUsers((prev) => [...prev, newUser]);
        await addUser(newUser, controller.signal);
        delete controllersRef.current[newUser.id];
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Запрос был отменен");
        } else {
          // Если сервер ответил ошибкой — нужно откатить изменения в UI (удалить юзера)
          setUsers((prev) => prev.filter((u) => u.id !== newUser.id));
          alert("Ошибка при сохранении!");
        }
      }
    }

    setUserForm(INITIAL_USER_FORM);
    setIsAddFormVisible(false);
  };

  const editUser = (id: string) => {
    setEditingId(id);
    setIsAddFormVisible(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
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

  if (isLoading) return <div style={{ color: "green" }}>...Loading</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Start to Fetch</h2>

      <button onClick={showAddForm} className="addUserBtn">
        ➕ Добавить пользователя
      </button>

      <AddUserForm
        userForm={userForm}
        isVisible={isAddFormVisible}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onCancel={hideAddForm}
      />

      <div>
        {users.map((user) => (
          <UserCard
            key={user.id}
            userInfo={user}
            isEditing={user.id === editingId}
            handleChange={handleChange}
            removeUser={() => removeUser(user.id)}
            editUser={() => editUser(user.id)}
            saveUser={handleSubmit}
            cancelEdit={cancelEdit}
            onToggleActive={() => onToggleActive(user.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
