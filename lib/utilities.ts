// Escape special characters for use in a regular expression
export const escapeRegExp = function (strToEscape) {
    return strToEscape.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

// Trim Characters at the start and the end
export const trimChar = function (origString, charToTrim) {
    charToTrim = escapeRegExp(charToTrim);
    var regEx = new RegExp('^[' + charToTrim + ']+|[' + charToTrim + ']+$', 'g');
    return origString.replace(regEx, '');
};

// Flattens nested arrays
export const flatten = function (items) {
    const flat = [];

    items.forEach((item) => {
        if (Array.isArray(item)) {
            flat.push(...flatten(item));
        } else {
            flat.push(item);
        }
    });

    return flat;
}