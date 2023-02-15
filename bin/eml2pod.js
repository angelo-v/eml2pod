#!/usr/bin/env node

const {readFile} = require("../dist/input/readFile");
const {run} = require("../dist/");

let outDir = process.argv[3] || "out";

const stream = readFile();

run(stream, outDir);
