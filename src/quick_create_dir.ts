/** 快速批量创建文件夹 */

import * as fs from "fs"
import * as path from "path"

/** 要创建的文件夹列表 */
let dirList: string[] = []
/** 基础路径 */
let basePath: string = "./"

// 是否有自定义的路径
if (process.argv[2] && fs.existsSync(process.argv[2])) {
    basePath = process.argv[2]
}

// 是否有自定义的文件夹列表
if (process.argv[3]) {
    dirList = process.argv[3].split(",")
}

// 逐一创建
for (let i = 0; i < dirList.length; i++) {
    let dir = dirList[i]
    let url = path.join(basePath, dir)
    if (fs.existsSync(url)) {
        console.log(`文件夹 ${dir} 已经创建了!,跳过`)
        continue
    }
    fs.mkdirSync(url, { "recursive": true })
    console.log(`文件夹 ${dir} 成功创建了!`)
}

console.log("打完收工")