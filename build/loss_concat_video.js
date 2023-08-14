"use strict";
/** 无损合并视频文件,主机必须要要有ffmpeg */
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
let targetDir = "./";
let outDir = "./";
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
// askQuestion("")
// 问答完后
rl.close();
