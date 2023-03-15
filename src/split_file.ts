import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

type configType_child = {
    /** 额外输出的文件夹 */
    dir?: string,
    /** 输出文件夹需要匹配的关键字 */
    map?: string[]
    /** 子节点 */
    children?: configType_child[]
    /** 排除的匹配关键字,可使用正则,英文字母请使用大写 */
    exMap?: string[]
    /** 相同的匹配关键字 */
    sameMap?: string[][]
    /** 没有关键字的dir */
    noKeyDir?: string
    /** 目标搜索的文件夹,仅限顶端有效 */
    targetDir?: string
    /** 输出的文件夹,仅限顶端有效 */
    outDir?: string
    /** 强制关键字,解决map和exMap冲突的问题 */
    forceMap?: string[]
}

/** 目标搜索的文件夹 */
let targetDir = "./"
/** 输出的文件夹 */
let outDir = "./"
/** 配置 */
let config: configType_child = {}

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

type collectType = {
    isKey: boolean,
    attr: string
}

/** 分割大法 */
let splitFunc = (str: string) => {
    let key = {
        "(": ")",
        "[": "]",
        "{": "}"
    }
    let targetKey = ""
    let cacheAttr = ""
    let collectData: collectType[] = []
    for (let i = 0; i < str.length; i++) {
        let a = str[i]
        if (targetKey) {
            if (key[targetKey] == a) {
                collectData.push({ isKey: true, attr: cacheAttr.trim() })
                cacheAttr = ""
                targetKey = ""
                continue
            }
            cacheAttr += a
            continue
        }
        if (key[a]) {
            if (cacheAttr) {
                collectData.push({ isKey: false, attr: cacheAttr.trim() })
                cacheAttr = ""
            }
            targetKey = a
            continue
        }
        cacheAttr += a
    }
    if (cacheAttr) {
        collectData.push({ isKey: false, attr: cacheAttr.trim() })
    }
    return collectData
}

/** 捕捉配置大法 */
let matchConfigFunc = (collectData: collectType[], baseDir?: string, childConfig?: configType_child, exMap?: string[]) => {
    if (!baseDir) {
        baseDir = outDir
    }
    if (!childConfig) {
        childConfig = config
    }
    baseDir = path.join(baseDir, childConfig.dir || "./")
    if (!exMap) {
        exMap = [...childConfig.exMap || []]
    }
    let cacheMap = [...childConfig?.map || [], ...childConfig?.forceMap || []]
    exMap.push(...cacheMap.map(c => c.toUpperCase()))
    if (!childConfig.children || childConfig.children.length == 0) {
        return { exMap, baseDir, childConfig }
    }
    for (let i = 0; i < childConfig.children.length; i++) {
        let child = childConfig.children[i]
        for (let j = 0; j < collectData.length; j++) {
            if (!collectData[j].isKey) {
                continue
            }
            let map = [...child?.map || []]
            map.push(...child?.forceMap || [])
            map = map.map(c => c.toUpperCase())
            if (map.includes(collectData[j].attr.toUpperCase())) {
                exMap.push(...child.exMap || [])
                return matchConfigFunc(collectData, baseDir, child, exMap)
            }
        }
    }
    return { exMap, baseDir, childConfig }
}

/** 获取文件夹名大法 */
let getDirFunc = (collectData: collectType[], childConfig: configType_child, exMap: string[]) => {
    let dir: string
    for (let i = 0; i < collectData.length; i++) {
        let child = collectData[i]
        let isContinue = false
        for (let j = 0; j < exMap.length; j++) {
            if (childConfig.forceMap && childConfig.forceMap.map(c => c.toUpperCase()).includes(exMap[j])) {
                continue
            }
            let reg = new RegExp(exMap[j])
            if (child.isKey && reg.test(child.attr.toUpperCase())) {
                isContinue = true
                break
            }
        }
        if (isContinue) {
            continue
        }
        if (!dir && child.isKey) {
            dir = child.attr
        }
        let sameMap = childConfig.sameMap || []
        for (let j = 0; j < sameMap.length; j++) {
            let same = [...sameMap[j]]
            same = same.map(c => c.toUpperCase())
            if (child.isKey && same.includes(child.attr.toUpperCase())) {
                dir = sameMap[j][0]
            }
        }
    }
    if (!dir) {
        if (childConfig.noKeyDir) {
            dir = childConfig.noKeyDir
        }
        else {
            dir = path.basename(collectData[0].attr)
        }

    }
    return dir
}

/** 整理文件夹大法 */
let trimDirFunc = (childConfig?: configType_child, baseDir?: string) => {
    if (!childConfig) {
        childConfig = config
    }
    if (!baseDir) {
        baseDir = outDir
    }
    if (childConfig.dir) {
        baseDir = path.join(baseDir, childConfig.dir)
    }
    if (childConfig.sameMap) {
        let nameList = fs.readdirSync(baseDir)
        for (let i = 0; i < nameList.length; i++) {
            let name = nameList[i]
            for (let j = 0; j < childConfig.sameMap.length; j++) {
                let sameMap = [...childConfig.sameMap[j].map(c => c.toUpperCase())]
                if (sameMap.indexOf(name.toUpperCase()) > 0) {
                    let targetDir = path.join(baseDir, childConfig.sameMap[j][0])
                    fs.mkdirSync(targetDir, { "recursive": true })
                    let oldDir = path.join(baseDir, name)
                    let childNameList = fs.readdirSync(oldDir)
                    console.log(`移动文件夹 ${oldDir} -> ${targetDir}`)
                    for (let k = 0; k < childNameList.length; k++) {
                        let fileUrl = path.join(oldDir, childNameList[k])
                        if (fs.statSync(fileUrl).isFile()) {
                            fs.renameSync(fileUrl, path.join(targetDir, childNameList[k]))
                        }
                    }
                    console.log(`删除文件夹 ${oldDir}`)
                    fs.rmdirSync(oldDir)

                }
            }

        }
    }

    if (childConfig.children) {
        for (let i = 0; i < childConfig.children.length; i++) {
            trimDirFunc(childConfig.children[i], baseDir)
        }
    }

}

/** 主进程 */
let mainFunc = (fileName: string) => {
    console.log(fileName)
    let collectData = splitFunc(fileName)
    let data = matchConfigFunc(collectData)
    // console.log(collectData)
    let dir = getDirFunc(collectData, data.childConfig, data.exMap)
    // console.log(dir)
    fs.mkdirSync(data.baseDir, { "recursive": true })
    let nameList = fs.readdirSync(data.baseDir)
    for (let i = 0; i < nameList.length; i++) {
        if (nameList[i].toUpperCase() == dir.toUpperCase()) {
            dir = nameList[i]
            break
        }
    }
    let newDir = path.join(data.baseDir, dir)
    console.log(newDir)
    fs.mkdirSync(newDir, { "recursive": true })
    let url = path.join(newDir, fileName)
    fs.renameSync(path.join(targetDir, fileName), url)
}

(async () => {

    // 先读取命令行的参数
    if (process.argv[2] && fs.existsSync(process.argv[2])) {
        let str = fs.readFileSync(process.argv[2], "utf-8")
        config = eval(`(${str})`)
        targetDir = config.targetDir || targetDir
        outDir = config.outDir || outDir
    }

    // 询问修改目标搜索的文件夹
    await questionFunc(`是否修改目标搜索的文件夹,默认:"${targetDir}",`, (answer) => {
        if (!answer) {
            return false
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径")
            return false
        }
        targetDir = answer
        return false
    })
    console.log(`目标搜索的文件夹:"${targetDir}"`)

    //询问修改输出的文件夹
    await questionFunc(`是否修改输出的文件夹,默认:"${outDir}",`, (answer) => {
        if (!answer) {
            return false
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径")
            return false
        }
        outDir = answer
        return false
    })
    console.log(`输出的文件夹:"${outDir}"`)

    //询问修改配置
    await questionFunc(`是否修改配置,请输入配置的路径,`, (answer) => {
        if (!answer) {
            return false
        }
        if (!fs.existsSync(answer)) {
            console.log("找不到该路径")
            return false
        }
        let str = fs.readFileSync(answer, "utf-8")
        config = eval(`(${str})`)
        targetDir = config.targetDir || targetDir
        outDir = config.outDir || outDir
        return false
    })
    console.log(config)

    // 主进程
    let fileNameList = fs.readdirSync(targetDir)
    for (let i = 0; i < fileNameList.length; i++) {
        let fileName = fileNameList[i]
        if (fs.statSync(path.join(targetDir, fileName)).isDirectory()) {
            continue
        }
        mainFunc(fileName)
    }

    // 询问整理文件夹
    await questionFunc("是否整理文件夹?Y/N,默认Y,", (answer) => {
        if (answer.toUpperCase() == "N") {
            console.log("不整理!")
            return false
        }
        trimDirFunc()

        return false
    })

    // 关闭询问
    rl.close()
    console.log("打完收工!")
})()

