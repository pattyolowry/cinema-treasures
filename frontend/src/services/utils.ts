import type { AxiosRequestConfig } from 'axios';

let authConfig: AxiosRequestConfig | undefined;

const setToken = (newToken: string | null) => {
  authConfig = newToken
    ? {
        headers: { Authorization: `Bearer ${newToken}` },
      }
    : undefined;
};

export default {
  setToken,
  getAuthConfig: () => authConfig,
};
