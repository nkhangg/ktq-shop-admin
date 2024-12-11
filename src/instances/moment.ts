import mt from 'moment-timezone';

const moment = (inp?: mt.MomentInput, strict?: boolean) => {
    const timezone = 'UTC';

    if (!inp) {
        console.error('Input is invalid:', inp);
        return mt.invalid();
    }

    if (timezone === 'UTC') {
        return mt.utc(inp, strict);
    }

    return mt(inp, strict).tz(timezone);
};

export const formatTime = (time: string, patent = 'DD/MM/YYYY HH:SS') => {
    return moment(time).format(patent);
};

export default moment;
