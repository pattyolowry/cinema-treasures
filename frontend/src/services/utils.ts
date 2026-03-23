const getAuthConfig = () => {
  const user = window.localStorage.getItem('loggedCinemaTreasuresUser')
  const parsedUser = JSON.parse(user)
  return parsedUser
    ? {
        headers: { Authorization: `Bearer ${parsedUser.token}` },
      }
    : undefined;
};

const backendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL
}

export default {
  getAuthConfig,
  backendUrl
};
