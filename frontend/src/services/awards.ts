import axios from 'axios';
import utils from './utils'
import { AwardYear } from '../types'

const baseUrl = `${utils.backendUrl()}/awards`;

const getAll = async () => {
  const { data } = await axios.get<AwardYear[]>(
    baseUrl,
    utils.getAuthConfig()
)

  return data;
}

export default {
    getAll
}