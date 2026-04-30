import { API_URL } from "../../../constants";
import type { ApiResponse, UserType } from "../../../shared/types";

export const getUsers = async (signal: AbortSignal): Promise<UserType[]> => {
  const res = await fetch(`${API_URL}/users`, { signal });
  if (!res.ok) {
    throw new Error("Server error");
  }
  return await res.json();
};

export const addUser = async (
  newUser: UserType,
  signal: AbortSignal,
): Promise<ApiResponse> => {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
    signal,
  });
  if (!res.ok) {
    throw new Error("Failed to add user");
  }
  return await res.json();
};
