const getAuthConfig = () => {
  const user = window.localStorage.getItem('loggedCinemaTreasuresUser');
  const parsedUser = JSON.parse(user);
  return parsedUser
    ? {
        headers: { Authorization: `Bearer ${parsedUser.token}` },
      }
    : undefined;
};

const backendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL;
};

const blogImageUrl = (imageKey?: string) => {
  const baseUrl = import.meta.env.VITE_BLOG_IMAGE_BASE_URL?.trim();
  const normalizedKey = imageKey?.trim();

  if (!baseUrl || !normalizedKey) {
    return null;
  }

  const trimmedBase = baseUrl.replace(/\/+$/, '');
  const trimmedKey = normalizedKey.replace(/^\/+/, '');

  return `${trimmedBase}/${trimmedKey}`;
};

export default {
  getAuthConfig,
  backendUrl,
  blogImageUrl,
};
