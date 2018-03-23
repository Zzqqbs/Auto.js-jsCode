let D = new Date().getTime();
// 内容读取
let a = ['/data/misc/wifi/wpa_supplicant.conf', '/sdcard/wlan.tmp'];
shell('cp ' + a[0] + ' ' + a[1], !0);
a[0] = files.read(a[1]);
files.remove(a[1]);
log(times());
// 字符处理
a[1] = /\w+=\{(\s+\w+=[^\n]+)+\s+\}/g;
a[1] = a[0].match(a[1]);
a[0] = [/ssid=[^\n]+/, /psk=[^\n]+/];
a[1].forEach((i) => {
    a[0].push(i.match(a[0][0]).join(''));
    i = i.match(a[0][1]);
    if (i) i = i.join('');
    a[0].push(i);
});
a[0].shift();
a[0].shift();
a[1] = [];
a[0].forEach((i) => {
    if (i) {
        if (i.substr(-1) == '"') {
            i = i.split('"')[1];
        } else {
            i = i.split('=')[1];
            i = decode(i);
        }
    }
    a[1].push(i);
});
a[0] = [];
a[2] = [];
for (let i = 0; i < a[1].length / 2; i++) {
    a[0][i] = a[1][i * 2];
    a[2][i] = a[1][i * 2 + 1];
}
a[1] = a.pop();
/* 数据格式：
   ssid a[0][i]
   psk  a[1][i]
*/
log(times());
// 结果输出
dialogs.select('查看密码：', a[0], (i) => {
    if (i > -1) {
        if (!a[1][i]) alert('无密码！');
        else confirm('复制密码：', a[1][i], (j) => {
            if (j) setClip('名称：' + a[0][i] + '\n密码：' + a[1][i]);
        });
    }
});

function decode(t) {
    t = t.split('');
    for (let i = 0; i < t.length; i += 2) {
        t[i] = '%' +t[i];
    }
    return decodeURI(t.join(''));
}

function times() { // 耗时
    let d = [new Date().getTime()];
    d[1] = (d[0] - D) / 1000;
    D = d[0];
    return d[1];
}