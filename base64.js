//'use strict';

if (typeof files === 'undefined') {
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
        hex2Base(d[i], d[i + 1], d[i + 2]).forEach((j, k) => {
            b[i / 3 * 4 + k] = j;
        });
    }
    switch (d.length % 3) {
        case 1:
            b[b.length - 2] = '=';
        case 2:
            b[b.length - 1] = '=';
    }
    return b.join('');
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
    return "data:" + fileType(path) + ";base64," + bytes2Base(files.readBytes(path));
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
        key[a] << 2 | b >> 4,
        (b << 4 | c >> 2) & 0xff,
        (c << 6 | key[d]) & 0xff
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
    switch ('=') { // 去尾
        case b.slice(-2, 1):
            d.pop();
        case b.slice(-1, 1):
            d.pop();
    }
    return d;
}

/**
 * Base64 保存为文件
 * @param {string} path 保存路径与文件名
 * @param {string} base Base64 字符串
 */
function base642File(path, base) {
    base = base.split(',')[1]; // 掐头
    files.writeBytes(path, base2Byte(base));
}

/**
 * 文本转 Unicode
 * @param {string} s 文本
 */
function string2Unicode(s) {
    let h = [];
    for (let i = 0; i < s.length; i++) {
        h[i] = s.charCodeAt(i);
    }
    return h;
}

/**
 * Unicode 转 UTF-8
 * @param {number[]} uni Unicode 编码，按字存放
 */
function unicode2UTF8(uni) {
    const a = function (u, b) {
        return 0x80 | u >> b & 0x3f;
    };
    let utf = [];
    uni.forEach((i) => {
        if (i < 0x80) {
            utf.push(i);
        } else if (i < 0x800) {
            utf.push(0xc0 | i >> 6, a(i, 0));
        } else if (i < 0x10000) {
            utf.push(0xe0 | i >> 12, a(i, 6), a(i, 0));
        } else if (i < 0x200000) {
            utf.push(0xf0 | i >> 18, a(i, 12), a(i, 6), a(i, 0));
        } else if (i < 0x4000000) {
            utf.push(0xf0 | i >> 24, a(i, 18), a(i, 12), a(i, 6), a(i, 0));
        } else if (i < 0x80000000) {
            utf.push(0xf0 | i >> 30, a(i, 24), a(i, 18), a(i, 12), a(i, 6), a(i, 0));
        } else {
            er('错误值：' + i);
        }
    });
    return utf;
}

/**
 * 文本编码
 * @param {string} str 输入字符串
 */
function string2Base(str) {
    return bytes2Base(unicode2UTF8(string2Unicode(str)));
}

/**
 * Unicode 转文本
 * @param {number[]} u Unicode
 */
function unicode2String(u) {
    let s = '';
    u.forEach((i) => {
        s += String.fromCharCode(i);
    });
    return s;
}

/**
 * UTF-8 转 Unicode
 * @param {number[]} utf 字节数组
 */
function utf2Unicode(utf) {
    const a = function (u, b) {
        return (u & 0x3f) << b;
    }
    let i = 0,
        uni = [];
    while (i < utf.length) {
        if (utf[i] < 0x80) {
            uni.push(utf[i]);
            i++;
        } else if (utf[i] < 0xc0) {
            er('错误值：' + utf[i]);
        } else if (utf[i] < 0xe0) {
            uni.push((utf[i] & 0x1f) << 6 | a(utf[i + 1], 0));
            i += 2;
        } else if (utf[i] < 0xf0) {
            uni.push((utf[i] & 0xf) << 12 | a(utf[i + 1], 6) | a(utf[i + 2], 0));
            i += 3;
        } else if (utf[i] < 0xf8) {
            uni.push((utf[i] & 7) << 18 | a(utf[i + 1], 12) | a(utf[i + 2], 6) | a(utf[i + 3], 0));
            i += 4;
        } else if (utf[i] < 0xfc) {
            uni.push((utf[i] & 3) << 24 | a(utf[i + 1], 18) | a(utf[i + 2], 12) | a(utf[i + 3], 6) | a(utf[i + 4], 0));
            i += 5;
        } else if (utf[i] < 0xfe) {
            uni.push((utf[i] & 1) << 30 | a(utf[i + 1], 24) | a(utf[i + 2], 28) | a(utf[i + 3], 12) | a(utf[i + 4], 6) | a(utf[i + 5], 0));
            i += 6;
        } else {
            er('错误值：' + utf[i]);
        }
    }
    return uni;
}

/**
 * 文本解码
 * @param {string} base Base64 字符串
 */
function base2String(base) {
    return unicode2String(utf2Unicode(base2Byte(base)));
}

module.exports = {
    encode: {
        file: file2Base64,
        string: string2Base
    },
    decode: {
        file: base642File,
        string: base2String
    }
};