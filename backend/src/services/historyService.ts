import LogEntry from '../models/logEntry'

const getHistory = async () => {
    const fullHistory = await LogEntry.find({})
    return fullHistory
}

export default {
  getHistory
};