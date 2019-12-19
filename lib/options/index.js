"use babel";

const getConfigOption = key => atom.config.get(`atom-better-comments.${key}`);
const setConfigOption = (key, value) =>
  atom.config.set(`atom-better-comments.${key}`, value);

const getTags = () => getConfigOption("tags");

export default {
  getTags
};
