import { API_URL } from "../../../constants";
import type {
  ApiResponse,
  UserFormData,
  UserType,
} from "../../../shared/types";

const getErrorMessage = (status: number) => {
  if (status >= 500) return "Server error. Please try again later.";
  if (status === 404) return "Resource not found.";
  if (status === 400) return "Validation error.";
  return `Request failed with status ${status}.`;
};

const parseJsonIfExists = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return await res.json();
};

const request = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiResponse<T>> => {
  const res = await fetch(input, init);
  const body = await parseJsonIfExists(res);

  if (!res.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : getErrorMessage(res.status);
    throw new Error(message);
  }

  return {
    success: true,
    status: res.status,
    data: body as T,
  };
};

export const getUsers = async (signal: AbortSignal): Promise<UserType[]> => {
  const response = await request<UserType[]>(`${API_URL}/users`, { signal });
  return response.data ?? [];
};

export const addUser = async (
  newUser: UserType,
  signal: AbortSignal,
): Promise<ApiResponse<UserType>> => {
  return await request<UserType>(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
    signal,
  });
};

export const deleteUser = async (
  id: string,
  signal: AbortSignal,
): Promise<ApiResponse<null>> => {
  const response = await request<null>(`${API_URL}/users/${id}`, {
    method: "DELETE",
    signal,
  });

  return {
    ...response,
    message: "User deleted successfully.",
  };
};

export const updateUser = async (
  id: string,
  userData: UserFormData,
  signal: AbortSignal,
): Promise<ApiResponse<UserType>> => {
  return await request<UserType>(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    signal,
  });
};
