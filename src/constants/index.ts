export const API_URL = "http://localhost:3000";

export const ROLES = ["Admin", "Moderator", "Editor", "Viewer"] as const;

export type Role = (typeof ROLES)[number];

export const LoadingState = {
  Idle: "idle",
  Loading: "loading",
  Succeeded: "succeeded",
  Failed: "failed",
} as const;

export type LoadingStateType = (typeof LoadingState)[keyof typeof LoadingState];
