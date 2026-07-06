import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  if (!file) return null;
  const extName = path.extname(file.originalname);
  return parser.format(extName, file.buffer).content;
};

export default getDataUri;
