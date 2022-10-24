const vscode = require('vscode');
const os = require('os');
const tinify = require('tinify');
const Client = require('ssh2-sftp-client');
const { tinifyKeyArr, tinifyValidate, tinifyCompress } = require('../utils/index');

const regImg = /^.*\.(jpg|jpeg|png|webp|svg|gif|ico)$/i; // 图片格式
const jsreg = /^.*\.(js|ts|vue|jsx|tsx|json)$/i;
const cssreg = /^.*\.(css|less|scss)$/i;

let tinifyIndex = 0;
// 是否windows
let isWindows = os.type() === 'Windows_NT';
class Upload {
  constructor(fileList, editor = null) {
    this.sftp = null;
    this.editor = editor; // 记录光标位置
    this.fileList = fileList;
    this.gzip = false;
    this.domain = '';
    this.init();
  }
  async init() {
    // 没有光标，没有数据
    if (!this.editor || !this.fileList.length) {
      return;
    }
    // 获取参数配置
    const { userName, password, domain, gzip, host, port } =
      vscode.workspace.getConfiguration('img_file');
    this.gzip = gzip;
    this.domain = domain;
    if (!userName || !password || !domain) {
      vscode.window.showWarningMessage('请配置服务器上传参数');
      return;
    }
    // 连接服务器
    const res = await this.getClient(userName, password, host, port);
    if (!res) {
      vscode.window.showWarningMessage('服务器连接失败');
      return;
    }
    this.sftp = res;
    if (this.gzip) {
      tinify.key = tinifyKeyArr[tinifyIndex];
      const count = await tinifyValidate(tinify);
      if (this.fileList.length > 500 - count) {
        if (tinifyIndex < tinifyKeyArr.length - 1) {
          tinifyIndex += 1;
        }
        if (tinifyIndex === tinifyKeyArr.length - 1) {
          tinifyIndex = 0;
        }
        tinify.key = tinifyKeyArr[tinifyIndex];
      }
    }
    const urlStr = await this.uploadFile();
    this.addUrlToEditor(urlStr);
  }
  // 连接服务器
  getClient(username, password, host, port) {
    return new Promise((resolve, reject) => {
      // 连接服务器
      const sftp = new Client();
      sftp
        .connect({
          host,
          port,
          username,
          password,
          readyTimeout: 1000,
          retry_minTimeout: 1000,
        })
        .then(() => {
          resolve(sftp);
        })
        .catch(() => {
          resolve();
        });
    });
  }
  // 将链接插入光标位置
  addUrlToEditor(url) {
    const { start, end, active } = this.editor.selection;
    if (start.line === end.line && start.character === end.character) {
      // 在光标位置插入内容
      const activePosition = active;
      this.editor.edit((editBuilder) => {
        editBuilder.insert(activePosition, url);
      });
    } else {
      // 替换内容
      const selection = this.editor.selection;
      this.editor.edit((editBuilder) => {
        editBuilder.replace(selection, url);
      });
    }
  }
  // 图片、文件上传
  uploadFile() {
    const self = this;
    let fileArr = [];
    this.fileList.forEach((item) => {
      const filePath = item.path; // 文件路径
      const fileName = filePath.match(/[^\\/]+$/)[0]; // 文件名称和后缀
      let dirName = ''; // 服务器文件夹
      if (regImg.test(fileName)) {
        dirName = 'img';
      } else if (jsreg.test(fileName)) {
        dirName = 'js';
      } else if (cssreg.test(fileName)) {
        dirName = 'css';
      } else {
        dirName = 'source';
      }
      fileArr.push({
        filePath: isWindows ? filePath.replace(/^[/]/, '') : filePath,
        fileName,
        dirName,
      });
    });

    const len = fileArr.length; // 请求总数量
    let sendCount = 0;
    let finishCount = 0;
    let urlArr = [];

    return new Promise((resolve, reject) => {
      while (sendCount < len) {
        next();
      }
      function next() {
        let current = sendCount++;
        const { filePath, fileName, dirName } = fileArr[current];
        // 图片压缩
        if (dirName === 'img' && self.gzip) {
          tinifyCompress(tinify, filePath)
            .then((res) => {
              self.sftp
                .put(res, `/yika/h5/${dirName}/${fileName}`)
                .then(() => {
                  finishCount += 1;
                  urlArr.push(`${self.domain}${dirName}/${fileName}`);
                  // console.log(`${self.domain}${dirName}/${fileName}`);
                  //  终止
                  if (finishCount === len) {
                    resolve(urlArr.join(','));
                  }
                })
                .catch(() => {
                  vscode.window.showErrorMessage(`${fileName}上传失败`);
                  finishCount += 1;
                  urlArr.push('');
                  // 终止
                  if (finishCount === len) {
                    resolve(urlArr.join(','));
                  }
                });
            })
            .catch(() => {
              // 压缩失败直接上传
              self.sftp
                .put(filePath, `/yika/h5/${dirName}/${fileName}`)
                .then(() => {
                  finishCount += 1;
                  urlArr.push(`${self.domain}${dirName}/${fileName}`);
                  // console.log(`${self.domain}${dirName}/${fileName}`);
                  //  终止
                  if (finishCount === len) {
                    resolve(urlArr.join(','));
                  }
                })
                .catch(() => {
                  vscode.window.showErrorMessage(`${fileName}上传失败`);
                  finishCount += 1;
                  urlArr.push('');
                  // 终止
                  if (finishCount === len) {
                    resolve(urlArr.join(','));
                  }
                });
            });
        } else {
          // 不压缩
          self.sftp
            .put(filePath, `/yika/h5/${dirName}/${fileName}`)
            .then(() => {
              finishCount += 1;
              urlArr.push(`${self.domain}${dirName}/${fileName}`);
              // console.log(`${self.domain}${dirName}/${fileName}`);
              //  终止
              if (finishCount === len) {
                resolve(urlArr.join(','));
              }
            })
            .catch(() => {
              vscode.window.showErrorMessage(`${fileName}上传失败`);
              finishCount += 1;
              urlArr.push('');
              // 终止
              if (finishCount === len) {
                resolve(urlArr.join(','));
              }
            });
        }
      }
    });
  }
}

module.exports = Upload;
