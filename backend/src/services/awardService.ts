import AwardYear from '../models/award'

const getAll = async () => {
    const awards = await AwardYear.find({})
    return awards
}

export default {
    getAll
}