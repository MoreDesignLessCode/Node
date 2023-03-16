export const formatString = (str: string, ...val: string[]) => {
    for (let index = 0; index < val.length; index++) {
        const regexp = new RegExp(`\\{${index}\\}`, 'gi');
        str = str.replace(regexp, val[index]);
    }
    return str;
};
