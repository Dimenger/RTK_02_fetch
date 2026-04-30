import { type ChangeEvent, type SubmitEvent } from "react";
import { ROLES } from "../../../constants";
import type { UserFormData } from "../../../shared/types";
import styles from "./add-user-form.module.css";

interface AddUserFormProps {
  userForm: UserFormData;
  isVisible: boolean;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export const AddUserForm = ({
  userForm,
  isVisible,
  isSubmitting,
  handleChange,
  handleSubmit,
  onCancel,
}: AddUserFormProps) => {
  if (!isVisible) return null;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Добавить нового сотрудника</h3>

      <div className={styles.fields}>
        <input
          type="text"
          name="name"
          placeholder="Имя"
          value={userForm.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userForm.email}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Возраст"
          value={userForm.age || ""}
          onChange={handleChange}
        />
        <input
          type="text"
          name="city"
          placeholder="Город"
          value={userForm.city}
          onChange={handleChange}
        />

        <select name="role" value={userForm.role} onChange={handleChange}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isActive"
            checked={userForm.isActive}
            onChange={handleChange}
          />
          Активен
        </label>
      </div>

      <input
        type="number"
        name="score"
        placeholder="Баллы"
        value={userForm.score || ""}
        onChange={handleChange}
        className={styles.scoreInput}
      />

      <div className={styles.formButtons}>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          Создать пользователя
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>
          Отмена
        </button>
      </div>
    </form>
  );
};
