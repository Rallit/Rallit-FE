export const authMode =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_MODE !== "api"
    ? "mock"
    : "api";
