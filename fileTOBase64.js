let path = "/storage/emulated/0/fooViewSave/Screenshot_20180318180855.jpg";
path = fileTOBase(path);
log(path);

function fileTOBase(p) {
    let data = files.readBytes(p);
    data = byteToBit(data);
    // 补位
    const lack = 6 - data.length % 6;
    for (let i = 0; i < data.length; i++) {
        data[i] += "0";
    }
    data = bitToBase(data);
    // 加入文件信息
    data = "data:" + fileType(p) + ";base64," + data;
    for (let i = 0; i < lack / 2; i++) {
        data += "=";
    }
    return data;
}

function byteToBit(b) {
    let bit = '';
    b.forEach((i) => {
        i = (i < 0 ? i + 256 : i).toString(2);
        if (i.length < 8) {
            i = i.split('');
            i.reverse();
            for (let j = i.length; j < 8; j++) {
                i[j] = '0';
            }
            i.reverse();
            i = i.join('');
        }
        bit += i;
    });
    return bit;
}

function bitToBase(b) {
    let bit = [],
        base = '';
    // 分组（6 位一组）
    for (let i = 0; i < b.length; i += 6) {
        bit.push(b.subsfr(i, 6));
    }
    // 建立编码对照表
    const key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890+/".split('');
    bit.forEach((i) => {
        i = parseInt(i, 2);
        base += key[i];
    });
    return base;
}

function fileType(f) {
    // 文件后缀列表
    const img = ['jpeg', 'png', 'gif'],
        txt = ['css', 'html', 'js'];
    if (f == 'jpg') f = 'jpeg';
    for (let i = 0; i < img.length; i++) {
        if (f == img[i]) {
            return 'image/' + img[i];
        }
    }
    for (let i = 0; i < txt.length; i++) {
        if (f == txt[i]) {
            return 'text/' + txt[i];
        }
    }
    // 错误提示
    f = '不支持些类型文件！';
    toast(f);
    console.error(f);
    exit();
}