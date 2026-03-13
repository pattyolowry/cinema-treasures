import axios from 'axios';
const baseUrl = '/users/login'
import type { LoggedUser, UserCredentials } from '../types'

const login = async (credentials: UserCredentials) => {
  const response = await axios.post<LoggedUser>(baseUrl, credentials);
  return response.data;
};

export default { login };
