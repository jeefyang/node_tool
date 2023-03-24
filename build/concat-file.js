"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
let targetDir = `./`;
let outDir = `./`;
if (process.argv[2]) {
    targetDir = process.argv[2];
}
if (process.argv[3]) {
    outDir = process.argv[3];
}
if (!fs.existsSync(targetDir)) {
    console.log("文件夹不存在");
    process.exit();
}
if (!fs.statSync(targetDir).isDirectory()) {
    console.log("不是文件夹");
    process.exit();
}
let loopFunc = (dir) => {
    let fileName = fs.readdirSync(path.join(targetDir, dir));
    for (let i = 0; i < fileName.length; i++) {
        let url = path.join(targetDir, dir, fileName[i]);
        if (fs.statSync(url).isDirectory()) {
            loopFunc(path.join(dir, fileName[i]));
            continue;
        }
        let newUrl = path.join(outDir, fileName[i]);
        if (fs.existsSync(newUrl)) {
            let fixDir = path.join(outDir, dir);
            fs.mkdirSync(fixDir, { recursive: true });
            let fixUrl = path.join(fixDir, fileName[i]);
            console.log(`出现重名,即将: ${url} -> ${fixUrl}`);
            fs.renameSync(url, fixUrl);
            continue;
        }
        console.log(`即将: ${url} -> ${newUrl}`);
        fs.renameSync(url, newUrl);
    }
};
loopFunc("./");
