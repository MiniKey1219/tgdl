/**
 * Numbers of decimal digits to round to
 */
const scale = 3;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, percent, minPercent) {
    if (rank > 50) {
        return 0;
    }
    if (rank > 25 && percent < 100) {
        return 0;
    }

    // New formula
    let score = 0;
    
    if(rank > 0 && rank <= 20) {
        score = (250 - 100.39) * Math.pow(1.168, (1 - rank)) + 100.39;
    } else if (rank > 20 && rank <= 35) {
        score = (250 - 83.389) * Math.pow(1.0099685, (2 - rank)) - 31.152;
    } else if (rank > 35 && rank <= 55) {
        score = 212.61 * Math.pow(1.036, (1 - rank)) + 25.071;
    } else if (rank > 55 && rank <= 150) {
        score = 56.191 * Math.pow(2, (54.147 - (x + 3.2)) * (Math.log(50) / 99)) + 6.273;
    }

    score = Math.max(0, score);

    if (percent != 100) {
        return round(score - score / 3);
    }

    return Math.max(round(score), 0);
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
