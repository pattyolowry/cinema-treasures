import axios from "axios";
import utils from "./utils";
import { Treasure, NewTreasure } from "../types";

const baseUrl = `${utils.backendUrl()}/treasures`;

const getAll = async (detailed: boolean = true) => {
  const { data } = await axios.get<Treasure[]>(baseUrl, {
    params: { detailed },
  });

  return data;
};

const addTreasure = async (treasure: NewTreasure) => {
  const { data } = await axios.post<Treasure>(
    baseUrl,
    treasure,
    utils.getAuthConfig(),
  );

  return data;
};

const updateTreasure = async (id: string, treasure: NewTreasure) => {
  const { data } = await axios.put<Treasure>(
    `${baseUrl}/${id}`,
    treasure,
    utils.getAuthConfig(),
  );

  return data;
};

const deleteTreasure = async (id: string) => {
  const { data } = await axios.delete(
    `${baseUrl}/${id}`,
    utils.getAuthConfig(),
  );

  return data;
};

const getTreasureActivity = async (id: string) => {
  const { data } = await axios.get(`${baseUrl}/${id}/activity`);

  return data;
};

export default {
  getAll,
  addTreasure,
  updateTreasure,
  deleteTreasure,
  getTreasureActivity,
};
