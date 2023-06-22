const camelToKebabCase = str => {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
};

export default camelToKebabCase;
