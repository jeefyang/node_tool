/** 无损合并视频文件,主机必须要要有ffmpeg */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"


let targetDir = "./"
let outDir = "./"
let ffmpegUrl = "ffmpeg"
let exName = "webm"


let input = process.argv[2]
if (input) {
    targetDir = input
}
input = undefined
input = process.argv[3]
if (input) {
    outDir = input
}



if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
    fs.mkdirSync(outDir, { recursive: true })
}


let files = fs.readdirSync(targetDir)
for (let i = 0; i < files.length; i++) {
    let targetUrl = path.join(targetDir, files[i])
    if (fs.statSync(targetUrl).isDirectory()) {
        continue
    }
    let arr = files[i].split(".")
    if (arr[arr.length - 1] == exName) {
        continue
    }
    arr[arr.length - 1] = exName
    let newFileName = arr.join(".")
    let outUrl = path.join(outDir, newFileName)


    let v1 = `${ffmpegUrl} -i ${targetUrl} -b:v 0 -crf 30 -pass 1 -an -f webm NUL -y && ${ffmpegUrl} -i ${targetUrl} -b:v 0 -crf 30 -pass 2 ${outUrl} -y`
    // let v1 = `${ffmpegUrl} -i ${targetUrl} ${outUrl} -y`
    console.log(v1)
    console.log(`正在转换:${i + 1}/${files.length}`)
    execSync(v1)
}

console.log("打完收工")
