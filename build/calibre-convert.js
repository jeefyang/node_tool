"use strict";
// 需要含有calibre主体和zip压缩插件
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const child = require("child_process");
const zip = require("jszip");
/** 程序位置 */
let exePath = "D:/calibre_new/Calibre Portable/Calibre";
/** 程序名 */
let exeName = "ebook-convert";
/** 目标地址 */
let targtPath = "//192.168.123.3/藏经阁/docker/bdyun/baidunetdiskdownload/jav0603/pdf";
/** 检索可转换的后缀名 */
let convertExList = ["pdf", "mobi", "epub"];
/** 需要二次打包的后缀名 */
let rezipExList = ["epub"];
/**  需要重新压缩的数据 */
let newRezipList = [];
// let convertExList = ["pdf"]
/** 压缩后缀名 */
let convertTargetEX = "zip";
/** 图片缓存文件夹,会自动删除 */
// let cacheImgDir = "./img"
let cacheImgDir = path.join(targtPath, "img");
/** 图片名起点 */
let start = 1000000;
/**
 * @param {string} url 注解
 * @param {(str:string)=>void} cb
 */
let loopReadFunc = (url, cb) => {
    let dirList = fs.readdirSync(url);
    for (let i = 0; i < dirList.length; i++) {
        let dir = dirList[i];
        let newUrl = path.join(url, dir);
        let stat = fs.statSync(newUrl);
        if (stat.isDirectory()) {
            loopReadFunc(newUrl, cb);
        }
        else if (stat.isFile()) {
            cb(newUrl);
        }
    }
};
/**
 * @param {string} [fileUrl] 注解
 */
let rezipFunc = async (fileUrl, ex) => {
    console.log(`准备重解压:${fileUrl}`);
    let b = fs.readFileSync(fileUrl, { "encoding": "binary" });
    let data = await zip.loadAsync(b);
    let isFirst = true;
    /** @type {string[]} */
    let imgList = [];
    /** @type {string[]} */
    let indexList = [];
    // 收集
    for (let key in data.files) {
        let file = data.files[key];
        let nameArr = file.name.split("/");
        if (nameArr.length <= 2) {
            continue;
        }
        if (nameArr[nameArr.length - 2] != "html" || nameArr[nameArr.length - 1].indexOf("html") == -1) {
            continue;
        }
        let baseName = path.basename(key, ".html");
        if (!isFirst) {
            continue;
        }
        let content = await file.async("text");
        let reg = new RegExp('<img?.*/>');
        let imgStr = content.match(reg);
        let targetUrl = imgStr[0].split('"')[1];
        let newTargetUrl = path.join(key, "..", targetUrl);
        imgList.push(newTargetUrl);
        indexList.push(baseName);
    }
    if (imgList.length == 0) {
        return;
    }
    console.log(imgList.length, indexList.length);
    // 新建文件夹
    fs.mkdirSync(cacheImgDir, { "recursive": true });
    // indexList.forEach((index, i) => {
    //     if (index == 2) {
    //         console.log(imgList[i])
    //     }
    // })
    //重排序
    for (let key in data.files) {
        let file = data.files[key];
        let nameArr = file.name.split("/");
        if (nameArr.length <= 2) {
            continue;
        }
        if (nameArr[nameArr.length - 2] != "image" || !nameArr[nameArr.length - 1]) {
            continue;
        }
        /** @type {string} 注解 */
        let fileName;
        let index = imgList.indexOf(key);
        // console.log(key)
        // 非数字页数
        if (index == -1) {
            fileName = path.basename(key);
            console.log(fileName);
        }
        //数字页数
        else {
            // console.log(indexList[index], key)
            let exName = path.extname(key);
            let num = Number(indexList[index]);
            if (isNaN(num)) {
                fileName = `${indexList[index]}${exName}`;
            }
            else {
                fileName = `rename_${start + num}${exName}`;
            }
        }
        let b64 = await file.async("base64");
        let newUrl = path.join(cacheImgDir, fileName);
        // console.log(newUrl)
        fs.writeFileSync(newUrl, b64, { "encoding": "base64" });
    }
    let newZip = new zip();
    let files = fs.readdirSync(cacheImgDir);
    console.log("正在添加新的压缩文件");
    files.forEach((fileName, index) => {
        let url = path.join(cacheImgDir, fileName);
        newZip.file(fileName, fs.readFileSync(url));
    });
    let bdata = await newZip.generateAsync({
        type: 'nodebuffer'
    });
    let newFileUrlArr = fileUrl.split('.');
    newFileUrlArr = newFileUrlArr.filter(c => rezipExList.indexOf(c) == -1);
    let newFileUrl = newFileUrlArr.join(".");
    console.log("正在重新压缩", newFileUrl);
    fs.writeFileSync(newFileUrl, bdata);
    console.log(`${fileUrl} 已经转换为 ${newFileUrl}`);
    fs.unlinkSync(fileUrl);
    console.log(`删除旧文件 ${fileUrl}`);
    fs.rmdirSync(cacheImgDir);
    console.log(`删除缓存文件夹 ${cacheImgDir}`);
};
let loopRezipFunc = async () => {
    for (let i = 0; i < newRezipList.length; i++) {
        await rezipFunc(newRezipList[i].url, newRezipList[i].ex);
    }
    return;
};
console.log(targtPath);
//转换
loopReadFunc(targtPath, (url) => {
    let extname = path.extname(url).split('.')[1];
    if (!extname || !convertExList.includes(extname)) {
        return;
    }
    let arr = url.split('.');
    arr.push(convertTargetEX);
    let newUrl = arr.join(".");
    // if (rezipExList.includes(extname)) {
    //     newRezipList.push({ ex: extname, url: newUrl })
    // }
    console.log(`当前正在转化 ${url}`);
    // let cmd = `cd ${exePath} && ${exeUrl} "${url}" "${newUrl}"`
    let cmd = `cd ${exePath} && ${exeName} "${url}" "${newUrl}"`;
    console.log(cmd);
    child.execSync(cmd);
    // console.log(`已经转化成功 ${url}`)
    // fs.unlinkSync(url)
    // console.log(`已经删除成功 ${url}`)
});
// 检查重压缩
loopReadFunc(targtPath, (url) => {
    let arr = url.split('.');
    if (arr.length <= 2) {
        return;
    }
    let a = arr[arr.length - 1];
    let b = arr[arr.length - 2];
    if (a == "zip" && rezipExList.includes(b)) {
        newRezipList.push({ ex: b, url: url });
    }
});
//重压缩开始
loopRezipFunc().then(() => {
    {
        console.log("mission complete!!!");
    }
});
