import axios from 'axios';
const baseUrl = "/history";
import utils from './utils'
import { LogEntry } from '../types'

const getAllEntries = async () => {
  const { data } = await axios.get<LogEntry[]>(
    baseUrl,
    utils.authConfig,
  );

  return data;
}

export default {
    getAllEntries
}