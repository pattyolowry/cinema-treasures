const getAuthConfig = () => {
  const user = window.localStorage.getItem('loggedCinemaTreasuresUser')
  const parsedUser = JSON.parse(user)
  return parsedUser
    ? {
        headers: { Authorization: `Bearer ${parsedUser.token}` },
      }
    : undefined;
};

export default {
  getAuthConfig
};
