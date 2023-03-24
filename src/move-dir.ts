import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"


/** 从文件夹 */
let fromDir = "./"
/** 到文件夹 */
let toDir = "./"
// 参数0(从文件夹)
if (process.argv[2] && fs.existsSync(process.argv[2])) {
    fromDir = process.argv[2]
}
// 参数1(到文件夹)
if (process.argv[3] && fs.existsSync(process.argv[3])) {
    toDir = process.argv[3]
}

/** 读取命令行对象 */
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
/** 问问题大法 */
let questionFunc = async (str: string, func: (answer: string) => boolean) => {
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
/** 是否强制覆盖 */
let isForceOver = false

/** 循环大法 */
let loopFunc = async (dir: string) => {
    fs.mkdirSync(path.join(toDir, dir), { "recursive": true })
    let fromDirUrl = path.join(fromDir, dir)
    let fileNameList = fs.readdirSync(fromDirUrl)
    for (let i = 0; i < fileNameList.length; i++) {
        let fileName = fileNameList[i]
        let fromUrl = path.join(fromDir, dir, fileName)
        let toUrl = path.join(toDir, dir, fileName)
        let stat = fs.statSync(fromUrl)
        if (stat.isDirectory()) {
            await loopFunc(path.join(dir, fileName))
        }
        else if (stat.isFile() && (isForceOver || !fs.existsSync(toUrl))) {
            console.log(`正在移动文件 ${fromUrl} -> ${toUrl}`)
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
        }
        else {
            console.log(`文件 ${toUrl} 已存在,跳过!`)
        }
    }
    if (path.join(fromDir) != fromDirUrl && fs.readdirSync(fromDirUrl).length == 0) {
        console.log(`删除从路径文件夹 ${fromDirUrl}`)
        fs.rmdirSync(fromDirUrl)
    }
    else {
        console.log(`从路径文件夹 ${fromDirUrl} 不为空,暂不删除`)
    }
    return
}
(async () => {

    await questionFunc(`当前从文件夹为 ${fromDir},是否需要修改?\n`, (answer) => {
        if (!answer) {
            return false
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径")
            return false
        }
        fromDir = answer
        return false
    })
    console.log(`从文件夹路径为 ${fromDir}`)

    await questionFunc(`当前到文件夹为 ${toDir},是否需要修改?\n`, (answer) => {
        if (!answer) {
            return false
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径")
            return false
        }
        toDir = answer
        return false
    })
    console.log(`到文件夹路径为 ${toDir}`)
    await questionFunc(`是否强制覆盖,y/n?(默认n)?\n`, (answer) => {
        if (!answer) {
            return false
        }
        if (answer.toLowerCase() == "y") {
            isForceOver = true
        }
        return false
    })
    // 关闭询问
    rl.close()
    // 从文件夹路径不对
    if (!fs.existsSync(fromDir) || !fs.statSync(fromDir).isDirectory()) {
        console.log(`从文件夹 ${fromDir} 不是文件夹!!!`)
        process.exit()
    }
    // 到文件夹路径不对
    if (!fs.existsSync(toDir) || !fs.statSync(toDir).isDirectory()) {
        console.log(`到文件夹 ${toDir} 不是文件夹!!!`)
        process.exit()
    }
    // 文件夹路径一致
    if (path.join(fromDir) == path.join(toDir)) {
        console.log(`文件夹一致,不用移动!!!`)
        process.exit()
    }
    await loopFunc("./")
    console.log("打完收工!")
})()