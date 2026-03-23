import axios from 'axios';
import utils from './utils'
import type { LoggedUser, UserCredentials } from '../types'

const baseUrl = `${utils.backendUrl()}/users/login`;

const login = async (credentials: UserCredentials) => {
  const response = await axios.post<LoggedUser>(baseUrl, credentials);
  return response.data;
};

export default { login };
