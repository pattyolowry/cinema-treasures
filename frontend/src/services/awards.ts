import axios from 'axios';
const baseUrl = "/api/awards";
import utils from './utils'
import { AwardYear } from '../types'

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