let authConfig = null;

const setToken = (newToken: string) => {
  authConfig = {
    headers: { Authorization: `Bearer ${newToken}` },
  }
};

export default {
    authConfig,
    setToken
}