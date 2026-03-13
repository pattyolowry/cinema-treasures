import axios from 'axios';
const baseUrl = '/users/login'
import { UserCredentials } from '../types'

const login = async (credentials: UserCredentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};

export default { login };