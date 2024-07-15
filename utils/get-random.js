module.exports = function getRandom (results, weights) {
    if(!results || !results.length){
        return '';
    }
    let num = Math.random(),
        s = 0,
        lastIndex = weights.length - 1;

    for (let i = 0; i < lastIndex; ++i) {
        s += weights[i];
        if (num < s) {
            return results[i];
        }
    }

    return results[lastIndex];
};