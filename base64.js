//'use strict';

if (typeof files == 'undefined') {
    const fs = require('fs');
    var files = {
        writeBytes: function (path, arr) {
            fs.writeFileSync(path, Buffer.from(arr));
        },
        readBytes: fs.readFileSync,
        getExtension: function (path) {
            return path.split('.')[1];
        }
    };
}

/**
 * 错误提示
 * @param {string} t 提示内容
 */
function er(t) {
    if (t) {
        toast(t);
        console.error(t);
    }
    exit();
}

const code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * 三字节同时编码
 * @param {byte} x 字节一
 * @param {byte} y 字节二
 * @param {byte} z 字节三
 */
function hex2Base(x, y, z) {
    return [
        code[x >> 2],
        code[((x << 4) + (y >> 4)) & 077],
        code[((y << 2) + (z >> 6)) & 077],
        code[z & 077]
    ];
}

/**
 * 字节数组编码
 * @param {number[]} d 字节数组
 */
function bytes2Base(d) {
    let b = [];
    if (!d) er('参数不是字节数组！');
    for (let i = 0; i < d.length; i += 3) {
        //threads.start(function () {
        hex2Base(d[i], d[i + 1], d[i + 2]).forEach((j, k) => {
            b[i / 3 * 4 + k] = j;
        });
        //});
    }
    return b;
}

/**
 * 文件类型判断
 * @param {string} f 文件路径
 */
function fileType(f) {
    // 文件后缀列表
    const img = ['jpeg', 'png', 'gif'],
        txt = ['css', 'html', 'js'];
    f = files.getExtension(f);
    if (f == 'jpg') f = 'jpeg';
    for (let i = 0; i < img.length; i++) {
        if (f == img[i]) return 'image/' + img[i];
    }
    for (let i = 0; i < txt.length; i++) {
        if (f == txt[i]) return 'text/' + txt[i];
    }
    // 错误提示
    er('不支持些类型文件！');
}

/**
 * 文件编码
 * @param {string} path 被编码文件路径
 */
function file2Base64(path) {
    let data = files.readBytes(path),
        base = bytes2Base(data);
    // 修改头尾信息
    switch (data.length % 3) {
        case 1:
            base[base.length - 2] = '=';
        case 2:
            base[base.length - 1] = '=';
    }
    return "data:" + fileType(path) + ";base64," + base.join('');
}

/**
 * 编码表生成解码表
 * @param {string[]} c 编码表
 */
function decodeTable(c) {
    let t = [];
    for (let i = 0; i < c.length; i++) {
        t[c[i]] = i;
    }
    return t;
}

const key = decodeTable(code);

/**
 * 解码为字节数组
 * @param {string} a 字符一
 * @param {string} b 字符二
 * @param {string} c 字符三
 * @param {string} d 字符四
 */
function base2Hex(a, b, c, d) {
    b = key[b];
    c = key[c];
    return [
        (key[a] << 2) + (b >> 4),
        ((b << 4) + (c >> 2)) & 0xff,
        ((c << 6) + key[d]) & 0xff
    ];
}

/**
 * Base64 字符串转字节数组
 * @param {string} b Base64 字符串
 */
function base2Byte(b) {
    let d = [];
    b = b.split('');
    for (let i = 0; i < b.length; i += 4) {
        base2Hex(b[i], b[i + 1], b[i + 2], b[i + 3]).forEach((j, k) => {
            d[i / 4 * 3 + k] = j;
        });
    }
    return d;
}

/**
 * Base64 保存为文件
 * @param {string} path 保存路径与文件名
 * @param {string} base Base64 字符串
 */
function base642File(path, base) {
    let data = [];
    base = base.split(',')[1]; // 掐头
    data = base2Byte(base);
    switch ('=') { // 去尾
        case base.slice(-2, 1):
            data.pop();
        case base.slice(-1, 1):
            data.pop();
    }
    files.writeBytes(path, data);
}

function string2Base(str) {
    let hex = [];
    str = str.split('');
    for (let i = 0; i < str.length; i++) hex[i] = str[i].charCodeAt(0);

    return hex;
}

module.exports = {
    file2Base: file2Base64,
    base2File: base642File,
    str2Base: string2Base // 未完成
};