import axios from 'axios';
import utils from './utils'
import { LogEntry, NewLogEntry } from '../types'

const baseUrl = `${utils.backendUrl()}/history`;

const getAllEntries = async () => {
  const { data } = await axios.get<LogEntry[]>(baseUrl)

  return data;
}

const addEntry = async (entry: NewLogEntry) => {
    const { data } = await axios.post<LogEntry>(
        baseUrl,
        entry,
        utils.getAuthConfig()
    )

    return data
}

const updateEntry = async (id: string, entry: NewLogEntry) => {
    const { data } = await axios.put<LogEntry>(
        `${baseUrl}/${id}`,
        entry,
        utils.getAuthConfig()
    )

    return data
}

const deleteEntry = async (id: string) => {
    const { data } = await axios.delete(
        `${baseUrl}/${id}`,
        utils.getAuthConfig()
    )

    return data
}

export default {
    getAllEntries,
    addEntry,
    updateEntry,
    deleteEntry
}
