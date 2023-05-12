
/**
 * 文件名数字补充0工具
 * 
 * 执行方式为
 * node xx.js [默认文件夹] [起点字符串位置] [截取到终点的字符串识别] [数字最大位数]
 */

import * as fs from "fs"
import * as path from "path"
import { exit } from "process"
import * as readline from "readline"


/** 读取命令行对象 */
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
/** 问问题大法 */
async function askQuestion(str: string, func: (answer: string) => boolean) {
    return new Promise((res, rej) => {
        rl.question(str, (answer) => {
            let check = func(answer)
            if (check) {
                rl.close()
            }
            res(undefined)
        })
    })
}

/** 移动文件 */
async function moveFile(fromUrl: string, toUrl: string) {
    try {
        fs.renameSync(fromUrl, toUrl)
    }
    // 一般是因为无法跨盘符
    catch (e) {
        let rs = fs.createReadStream(fromUrl)
        let ws = fs.createWriteStream(toUrl)
        rs.pipe(ws)
        await new Promise((res, rej) => {
            rs.on("end", () => {
                fs.rmSync
                fs.unlinkSync(fromUrl)
                res(undefined)
            })
        })
    }
    return
}

/** 默认文件夹 */
let baseUrl = "./"
/** 起点字符串位置 */
let start = 0
/** 截取到终点的字符串识别 */
let matchEnd = "."
/** 数字最大位数 */
let limitMax = 3;
let newFileList: string[] = [];


(async () => {

    // 参数0(默认文件夹)
    if (process.argv[2] && fs.existsSync(process.argv[2])) {
        baseUrl = process.argv[2]
    }
    // 参数1(起点字符串位置)
    if (process.argv[3] != "") {
        start = Number(process.argv[3])
    }
    //参数2(截取到终点的字符串识别)
    if (process.argv[4] != "") {
        matchEnd = process.argv[4]
    }
    //参数3(数字最大位数)
    if (process.argv[5] != "") {
        limitMax = Number(process.argv[5])
    }

    console.log("默认文件夹为:", baseUrl)
    await askQuestion(`是否替换文件夹?\n`, (answer) => {
        if (answer == "") {
            return false
        }
        if (!fs.existsSync(answer)) {
            console.log("文件夹不存在")
            return false
        }
        baseUrl = answer
    })
    console.log("默认文件夹为:", baseUrl)
    console.log("起点字符串位置：", start)
    await askQuestion(`是否修改起点字符串位置?\n`, (answer) => {
        if (answer == "") {
            return false
        }
        start = Number(answer)
    })
    console.log("起点字符串位置：", start)
    console.log('截取到终点的字符串识别:', matchEnd)
    await askQuestion(`是否修改截取到终点的字符串识别?\n`, (answer) => {
        if (answer == "") {
            return false
        }
        matchEnd = answer
    })
    console.log('截取到终点的字符串识别:', matchEnd)
    console.log("默认数字最大位数:", limitMax)
    await askQuestion(`是否修改默认数字最大位数?\n`, (answer) => {
        if (answer == "") {
            return false
        }
        limitMax = Number(answer)
    })
    console.log("默认数字最大位数:", limitMax)
    let fileList = fs.readdirSync(baseUrl)
    try {
        for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i]
            let endStr = file.slice(start)
            console.log(endStr)
            let match = endStr.match(matchEnd)
            console.log(match)
            let numStr = endStr.slice(0, match.index)
            let zeroNum = limitMax - numStr.length
            console.log(zeroNum)
            for (let j = 0; j < zeroNum; j++) {
                numStr = "0" + numStr
            }
            let newEndStr = endStr.replace(endStr.slice(0, match.index), numStr)
            let newFile = file.slice(0, start) + newEndStr
            newFileList.push(newFile)
            // console.log(endStr)
            // console.log(file[start])
        }
    }
    catch {
        console.log("处理失败")
        exit()
    }

    console.log("预览效果:")
    for (let i = 0; i < fileList.length; i++) {
        console.log(`${fileList[i]} --> ${newFileList[i]}`)
    }
    await askQuestion(`是否转换,y/n?(默认y)?\n`, (answer) => {
        if (answer.toLowerCase() == "n") {
            exit()
            return false
        }
    })
    for (let i = 0; i < fileList.length; i++) {
        await moveFile(path.join(baseUrl, fileList[i]), path.join(baseUrl, newFileList[i]))
    }
    console.log("转换成功")
    rl.close()
})()


