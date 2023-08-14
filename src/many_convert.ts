import * as fs from 'fs'
import * as path from "path"
import * as exec from "child_process"

let map = [
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev02_03_titfuck_tit.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev02_03_titfuck_face.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev16_01_scr.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/titlevideo.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev16_02_scr.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev16_03_scr.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev16_01_zoom.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev16_02_zoom.gif",
    "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/heshia/heshi/gif/ev16_05_zoom.gif",
]

let outDir = "output"

for (let i = 0; i < map.length; i++) {
    let url = map[i]
    let dir = path.dirname(url)
    let fileName = path.basename(url)
    let newDir = path.join(dir, outDir)
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(newDir, { recursive: true })
    }
    let newUrl = path.join(newDir, fileName)
    let cmd = `ffmpeg -i ${url} -r 1 ${newUrl}`
    exec.execSync(cmd)
    console.log(`正在转化:${url} -> ${newUrl}`)
}
console.log("打完收工")