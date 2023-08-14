"use strict";
/** 无损合并视频文件,主机必须要要有ffmpeg */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
let targetDir = "./";
let outDir = "./";
let cacheDirName = "cache";
let ffmpegUrl = "ffmpeg";
let input = process.argv[2];
if (input) {
    targetDir = input;
}
input = undefined;
input = process.argv[3];
if (input) {
    outDir = input;
}
console.log(targetDir, outDir);
let files = fs.readdirSync(targetDir);
if (!fs.statSync(outDir).isDirectory()) {
    fs.mkdirSync(outDir, { recursive: true });
}
let cacheUrl = path.join(outDir, cacheDirName);
if (!fs.statSync(cacheUrl).isDirectory()) {
    fs.mkdirSync(cacheUrl, { recursive: true });
}
for (let i = 0; i < files.length; i++) {
    let targetUrl = path.join(targetDir, files[i]);
    let outUrl = path.join(outDir, files[i]);
    (0, child_process_1.execSync)(`${ffmpegUrl} -i ${targetUrl} -b:v 0 -crf 30 -pass 1 -an -f webm ${cacheUrl}`);
    (0, child_process_1.execSync)(`${ffmpegUrl} -i ${targetUrl} -b:v 0 -crf 30 -pass 2 ${outUrl}`);
}
console.log("打完收工");
