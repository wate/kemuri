const fs = require('fs');
const glob = require('glob');
const path = require('path');

const srcDir = process.env.SOURCE_JS_DIR || "src";
const filePattern = process.env.BUILD_JS_FILE_PATTERN || "**/*.{js,ts}";

const srcFileKeys = glob.sync(filePattern, { cwd: srcDir });

console.log(srcFileKeys);
console.log('未実装');
