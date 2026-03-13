import axios from 'axios';
const baseUrl = "/api/treasures";
import utils from './utils'
import { Treasure, NewTreasure } from '../types'

const getAll = async () => {
  const { data } = await axios.get<Treasure[]>(baseUrl)

  return data;
}

const addTreasure = async (treasure: NewTreasure) => {
    const { data } = await axios.post<Treasure>(
        baseUrl,
        treasure,
        utils.getAuthConfig()
    )

    return data
}

const updateTreasure = async (id: string, treasure: NewTreasure) => {
    const { data } = await axios.put<Treasure>(
        `${baseUrl}/${id}`,
        treasure,
        utils.getAuthConfig()
    )

    return data
}

const deleteTreasure = async (id: string) => {
    const { data } = await axios.delete(
        `${baseUrl}/${id}`,
        utils.getAuthConfig()
    )

    return data
}

export default {
    getAll,
    addTreasure,
    updateTreasure,
    deleteTreasure
}
