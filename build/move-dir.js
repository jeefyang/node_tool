"use strict";
/** 主要用于移动整体文件夹 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const readline = require("readline");
/** 从文件夹 */
let fromDir = "./";
/** 到文件夹 */
let toDir = "./";
// 参数0(从文件夹)
if (process.argv[2] && fs.existsSync(process.argv[2])) {
    fromDir = process.argv[2];
}
// 参数1(到文件夹)
if (process.argv[3] && fs.existsSync(process.argv[3])) {
    toDir = process.argv[3];
}
/** 读取命令行对象 */
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
/** 问问题大法 */
async function askQuestion(str, func) {
    return new Promise((res, rej) => {
        rl.question(str, (answer) => {
            let check = func(answer);
            if (check) {
                rl.close();
            }
            res(undefined);
        });
    });
}
/** 是否强制覆盖 */
let isForceOver = false;
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
/** 移动文件夹 */
async function moveDir(fromDir, toDir, op, cb) {
    if (!op.currentDir) {
        op.currentDir = "./";
    }
    let currentFromDir = path.join(fromDir, op.currentDir);
    let currentToDir = path.join(toDir, op.currentDir);
    fs.mkdirSync(currentToDir, { "recursive": true });
    let filenameList = fs.readdirSync(currentFromDir);
    for (let i = 0; i < filenameList.length; i++) {
        let filename = filenameList[i];
        let fromUrl = path.join(currentFromDir, filename);
        let stat = fs.statSync(fromUrl);
        if (stat.isDirectory()) {
            let cloneOP = JSON.parse(JSON.stringify(op));
            cloneOP.currentDir = path.join(op.currentDir, filename);
            // console.log(fromDir,cloneOP.currentDir)
            await moveDir(fromDir, toDir, cloneOP, cb);
            continue;
        }
        let toUrl = path.join(currentToDir, filename);
        if (cb.moveBeforeCB) {
            await cb.moveBeforeCB(fromUrl, toUrl);
        }
        let isMove = false;
        if (stat.isFile() && (op.isForeOver || !fs.existsSync(toUrl))) {
            isMove = true;
            await moveFile(fromUrl, toUrl);
        }
        if (cb.moveAfterCB) {
            await cb.moveAfterCB(fromUrl, toUrl, isMove);
        }
    }
    if (cb.moveDirCB) {
        await cb.moveDirCB(currentFromDir);
    }
    return;
}
(async () => {
    await askQuestion(`当前从文件夹为 ${fromDir},是否需要修改?\n`, (answer) => {
        if (!answer) {
            return false;
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径");
            return false;
        }
        fromDir = answer;
        return false;
    });
    console.log(`从文件夹路径为 ${fromDir}`);
    await askQuestion(`当前到文件夹为 ${toDir},是否需要修改?\n`, (answer) => {
        if (!answer) {
            return false;
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径");
            return false;
        }
        toDir = answer;
        return false;
    });
    console.log(`到文件夹路径为 ${toDir}`);
    await askQuestion(`是否强制覆盖,y/n?(默认n)?\n`, (answer) => {
        if (!answer) {
            return false;
        }
        if (answer.toLowerCase() == "y") {
            isForceOver = true;
        }
        return false;
    });
    // 关闭询问
    rl.close();
    // 从文件夹路径不对
    if (!fs.existsSync(fromDir) || !fs.statSync(fromDir).isDirectory()) {
        console.log(`从文件夹 ${fromDir} 不是文件夹!!!`);
        process.exit();
    }
    // 到文件夹路径不对
    if (!fs.existsSync(toDir) || !fs.statSync(toDir).isDirectory()) {
        console.log(`到文件夹 ${toDir} 不是文件夹!!!`);
        process.exit();
    }
    // 文件夹路径一致
    if (path.join(fromDir) == path.join(toDir)) {
        console.log(`文件夹一致,不用移动!!!`);
        process.exit();
    }
    await moveDir(fromDir, toDir, {
        isForeOver: isForceOver,
    }, {
        moveBeforeCB: (fromUrl, toUrl) => {
            console.log(`正在移动文件 ${fromUrl} -> ${toUrl}`);
        },
        moveAfterCB: (_fromUrl, toUrl, isMove) => {
            if (isMove) {
                console.log(`文件 ${toUrl} 已存在,跳过!`);
            }
        },
        moveDirCB: (fromUrl) => {
            // 非从文件夹且文件夹的文件数量等于0
            if (path.join(fromDir) != fromUrl && fs.readdirSync(fromUrl).length == 0) {
                console.log(`删除从路径文件夹 ${fromUrl}`);
                fs.rmdirSync(fromUrl);
            }
            else {
                console.log(`从路径文件夹 ${fromUrl} 不为空,暂不删除`);
            }
        }
    });
    console.log("打完收工!");
})();
