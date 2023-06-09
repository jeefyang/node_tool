/** 通用的方法大全 */


import * as fs from "fs"
import * as path from "path"
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

// 问答完后
rl.close()

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

/** 移动文件夹 */
async function moveDir(fromDir: string, toDir: string, op: {
    /** 初始的时候不应该存在 */
    currentDir?: string

    /** 是否强制覆盖 */
    isForeOver?: boolean
}, cb: {
    moveBeforeCB?: (fromUrl: string, toUrl: string) => Promise<any> | void
    moveAfterCB?: (fromUrl: string, toUrl: string, isMove: boolean) => Promise<any> | void
    moveDirCB?: (fromDir: string) => Promise<any> | void
}) {
    if (!op.currentDir) {
        op.currentDir = "./"
    }
    let currentFromDir = path.join(fromDir, op.currentDir)
    let currentToDir = path.join(toDir, op.currentDir)
    fs.mkdirSync(currentToDir, { "recursive": true })
    let filenameList = fs.readdirSync(currentFromDir)
    for (let i = 0; i < filenameList.length; i++) {
        let filename = filenameList[i]
        let fromUrl = path.join(currentFromDir, filename)
        let stat = fs.statSync(fromUrl)
        if (stat.isDirectory()) {
            let cloneOP = JSON.parse(JSON.stringify(op))
            cloneOP.currentDir = path.join(op.currentDir, filename)
            await moveDir(fromDir, toDir, cloneOP, cb)
            continue
        }
        let toUrl = path.join(currentToDir, filename)
        if (cb.moveBeforeCB) {
            await cb.moveBeforeCB(fromUrl, toUrl)
        }
        let isMove = false
        if (stat.isFile() && (op.isForeOver || !fs.existsSync(toUrl))) {
            isMove = true
            await moveFile(fromUrl, toUrl)
        }
        if (cb.moveAfterCB) {
            await cb.moveAfterCB(fromUrl, toUrl, isMove)
        }
    }
    if (cb.moveDirCB) {
        await cb.moveDirCB(currentFromDir)
    }
    return
}

