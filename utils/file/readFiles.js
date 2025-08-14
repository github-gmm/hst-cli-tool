#! /usr/bin/env node

const { readFileContent } = require("./oprationFile");

module.exports = async function (outputPaths = []) {
  const result = await Promise.all(outputPaths.map(readFileContent));
  return result;
}