"use strict";
/** 抽丝剥茧将文件夹的所有文件,整合到另外的文件夹 */
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
/** 移动文件 */
async function moveFile(fromUrl, toUrl) {
    try {
        fs.renameSync(fromUrl, toUrl);
    }
    // 一般是因为无法跨盘符
    catch (e) {
        let rs = fs.createReadStream(fromUrl);
        let ws = fs.createWriteStream(toUrl);
        rs.pipe(ws);
        await new Promise((res, rej) => {
            rs.on("end", () => {
                fs.rmSync;
                fs.unlinkSync(fromUrl);
                res(undefined);
            });
        });
    }
    return;
}
let loopFunc = async (dir) => {
    let fileName = fs.readdirSync(path.join(targetDir, dir));
    for (let i = 0; i < fileName.length; i++) {
        let url = path.join(targetDir, dir, fileName[i]);
        if (fs.statSync(url).isDirectory()) {
            await loopFunc(path.join(dir, fileName[i]));
            continue;
        }
        let newUrl = path.join(outDir, fileName[i]);
        if (fs.existsSync(newUrl)) {
            let fixDir = path.join(outDir, dir);
            fs.mkdirSync(fixDir, { recursive: true });
            let fixUrl = path.join(fixDir, fileName[i]);
            console.log(`出现重名,即将: ${url} -> ${fixUrl}`);
            await moveFile(url, fixUrl);
            // fs.renameSync(url, fixUrl)
            continue;
        }
        console.log(`即将: ${url} -> ${newUrl}`);
        await moveFile(url, newUrl);
        // fs.renameSync(url, newUrl)
        return;
    }
};
loopFunc("./").then(() => {
    console.log("打完收工");
});
