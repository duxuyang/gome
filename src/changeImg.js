const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const tinify = require('tinify');

tinify.key = 'TMcdJ3MjwvhKmNXhwczMBwJGnJQ3f75t';

/**
 *  文件夹下增加 压缩 图片
 * @param {*} folderPath 文件夹路径
 * @param {*} fileList 图片列表
 */
const addImg = (folderPath, fileList) => {
  // 获取设置，是否压缩
  const { gzip } = vscode.workspace.getConfiguration('img_file');
  if (gzip) {
    fileList.forEach((item) => {
      const filename = path.basename(item.path);
      const paths = path.resolve(folderPath, filename);
      // 压缩完成放入目标目录
      tinify.fromFile(item.path).toFile(paths, (err) => {
        if (err instanceof tinify.AccountError) {
          // Verify your API key and account limit.
          console.log('The error message is: ' + err.message);
          return;
        } else if (err instanceof tinify.ClientError) {
          // Check your source image and request options.
          vscode.window.showErrorMessage('请核对图片资源和配置选项');
          return;
        } else if (err instanceof tinify.ServerError) {
          // Temporary issue with the Tinify API.
          vscode.window.showErrorMessage('Tinify API发生错误');
          return;
        } else if (err instanceof tinify.ConnectionError) {
          // A network connection error occurred.
          vscode.window.showErrorMessage('网络连接错误');
          return;
        }
        vscode.window.showInformationMessage('压缩成功');
      });
    });
  } else {
    fileList.forEach((item) => {
      // 把图片路径复制到目标路径文件夹
      const filename = path.basename(item.path);
      const paths = path.resolve(folderPath, filename);
      fs.copyFileSync(item.path, paths);
    });
  }
};

/**
 * vscode 项目里 直接选择图片压缩,可以同时选择多张
 * @param {*} fileList 图片列表
 */
const compressImg = (fileList) => {
  fileList.forEach((item) => {
    tinify.fromFile(item.path).toFile(item.path, (err) => {
      if (err instanceof tinify.AccountError) {
        // Verify your API key and account limit.
        console.log('The error message is: ' + err.message);
        return;
      } else if (err instanceof tinify.ClientError) {
        // Check your source image and request options.
        vscode.window.showErrorMessage('请核对图片资源和配置选项');
        return;
      } else if (err instanceof tinify.ServerError) {
        // Temporary issue with the Tinify API.
        vscode.window.showErrorMessage('Tinify API发生错误');
        return;
      } else if (err instanceof tinify.ConnectionError) {
        // A network connection error occurred.
        vscode.window.showErrorMessage('网络连接错误');
        return;
      }
      vscode.window.showInformationMessage('压缩成功');
    });
  });
};

module.exports = {
  addImg,
  compressImg,
};
