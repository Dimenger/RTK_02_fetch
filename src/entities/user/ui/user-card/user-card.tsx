import type { ChangeEvent, SubmitEvent } from "react";
import type { UserType } from "../../../../shared/types";
import { ROLES } from "../../../../constants";
import styles from "./user-card.module.css";

interface UserCardProps {
  userInfo: UserType;
  isEditing: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  removeUser: () => void;
  editUser: () => void;
  saveUser: (e: SubmitEvent<HTMLFormElement>) => void;
  cancelEdit: () => void;
  onToggleActive: () => void;
}

export const UserCard = ({
  userInfo,
  isEditing,
  handleChange,
  removeUser,
  editUser,
  saveUser,
  cancelEdit,
  onToggleActive,
}: UserCardProps) => {
  if (isEditing) {
    return (
      <form onSubmit={saveUser} className={styles.editForm}>
        <input
          name="name"
          value={userInfo.name}
          onChange={handleChange}
          placeholder="Имя"
        />
        <input
          name="email"
          value={userInfo.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="age"
          type="number"
          value={userInfo.age}
          onChange={handleChange}
          placeholder="Возраст"
        />
        <input
          name="city"
          value={userInfo.city}
          onChange={handleChange}
          placeholder="Город"
        />

        <select name="role" value={userInfo.role} onChange={handleChange}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            name="isActive"
            checked={userInfo.isActive}
            onChange={handleChange}
          />
          Активен
        </label>

        <input
          name="score"
          type="number"
          value={userInfo.score}
          onChange={handleChange}
          placeholder="Баллы"
        />

        <div className={styles.editFormButtons}>
          <button type="submit">✅ Save</button>
          <button type="button" onClick={cancelEdit}>
            ❌ Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={styles.user}>
      <ul>
        <li>Name: {userInfo.name}</li>
        <li>age: {userInfo.age}</li>
        <li>email: {userInfo.email}</li>
        <li>city: {userInfo.city}</li>
        <li>role: {userInfo.role}</li>
        <li>
          isActive
          <input
            type="checkbox"
            checked={userInfo.isActive}
            onChange={onToggleActive}
          />
        </li>
        <li>score: {userInfo.score}</li>
        <li>
          <button onClick={editUser}>✏️ Edit</button>
          <button onClick={removeUser}>🗑️ Remove</button>
        </li>
      </ul>
    </div>
  );
};
