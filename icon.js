// 三国杀的武将序号从1开始,然后是2,3,4....以此类推.在一个文件夹下存放武将头像,比如武将1号就是100,武将23号就是2300,武将215就是21500,举个例子https://web.sanguosha.com/220/h5_2/res/runtime/pc/general/skinShop/100.png存放的就是1号.
// 现在写一个脚本,按照顺序帮我获取1-3000的武将头像.
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * 下载单个图片
 * @param {string} url 图片地址
 * @param {string} dest 保存路径
 * @returns {Promise<void>}
 */
function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => {}); // 删除已创建的文件
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(dest, () => {}); // 删除已创建的文件
            reject(err);
        });
    });
}

const outDir = path.resolve(__dirname, 'avatars');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

async function downloadAll() {
    // 三国杀武将序号1-3000
    for (let i = 1; i <= 3000; i++) {
        // 构造图片编号 如 1 -> 100, 23 -> 2300, 215 -> 21500
        const imageNumber = i * 100;
        const url = `https://web.sanguosha.com/220/h5_2/res/runtime/pc/general/skinShop/${imageNumber}.png`;
        const dest = path.join(outDir, `${imageNumber}.png`);
        try {
            console.log(`Downloading ${url}`);
            await downloadImage(url, dest);
        } catch (e) {
            console.log(`Failed to download ${url}: ${e.message}`);
        }
    }
    console.log('All done');
}

downloadAll();