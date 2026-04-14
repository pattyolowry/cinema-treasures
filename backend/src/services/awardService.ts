import AwardYear from '../models/award';
import { AwardYearType } from '../types';

const getAll = async (visibleOnly: boolean = true) => {
    const awards = await AwardYear.find({}).lean<AwardYearType[]>();
    if (visibleOnly) {
        for (const year of awards) {
            year.categories = year.categories.filter(c => c.isVisible);
        }
    }

    return awards;
};

export default {
    getAll
};