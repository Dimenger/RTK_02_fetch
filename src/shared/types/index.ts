import type { Role } from "../../constants";

export interface UserType {
  id: string;
  name: string;
  age: number;
  email: string;
  city: string;
  role: Role;
  isActive: boolean;
  score: number;
}

export type UserFormData = Omit<UserType, "id">;

export const INITIAL_USER_FORM: UserFormData = {
  name: "",
  email: "",
  age: 0,
  city: "",
  role: "Viewer",
  isActive: true,
  score: 0,
};

export interface ApiResponse {
  success: boolean;
  message?: string; // необязательное поле, если сервер присылает текст
}
