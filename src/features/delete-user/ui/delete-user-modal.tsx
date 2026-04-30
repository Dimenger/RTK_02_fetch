import { useEffect, useRef } from "react";
import styles from "./delete-user-modal.module.css";

interface DeleteUserModalProps {
  isOpen: boolean;
  userName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteUserModal = ({
  isOpen,
  userName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteUserModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusableElements = () => {
      if (!modalRef.current) return [] as HTMLElement[];

      return Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      modalRef.current?.focus();
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }

      if (event.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus();
    };
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Delete user confirmation"
        tabIndex={-1}
      >
        <h3 className={styles.title}>Удалить пользователя?</h3>
        <p className={styles.text}>
          Пользователь <strong>{userName}</strong> будет удален без возможности
          восстановления.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
};
