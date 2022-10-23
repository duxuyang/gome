// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const { compressImg, addImg } = require('./src/changeImg');
const { changeCss } = require('./src/changeCss');
const Upload= require('./src/upload');
const { regImg } = require('./utils');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "gome" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json

  // 添加图片，图片压缩
  let gomeImg = vscode.commands.registerCommand('gome.chooseImg', async (param, edit) => {
    const filePath = param.path;

    // 文件路径是否存在
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      // 判断是否文件夹
      if (!stats.isDirectory()) {
        // 选择的图片，可以在vscode里面多选
        if (regImg.test(filePath)) {
          compressImg(edit);
        }
        return;
      }
      // 选择图片弹框
      const fileList = await vscode.window.showOpenDialog({
        canSelectFolders: false, // 是否可以选择文件夹,只能选择文件
        canSelectMany: true, // 是否多选
        filters: {
          images: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        },
      });
      fileList && addImg(param.path, fileList);
    }
  });

  // css 像素转换
  let cssChange = vscode.commands.registerTextEditorCommand(
    'gome.changeCss',
    (textEditor, edit) => {

      //选中文本内容
      const cssText = textEditor.document.getText(textEditor.selection);
      // 空字符串过滤
      if (!cssText.trim()) {
        return;
      }
      // 生成转换后的文本
      const newCss = changeCss(cssText);
      // 选中文本替换
      edit.replace(textEditor.selection, newCss)
    }
  )

  // 图片/文件 上传
  let fileSelect = vscode.commands.registerCommand(
    'gome.choosedFile',
    async (textEditor, edit, args) => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from xxmj-upload!')
      const fileList = await vscode.window.showOpenDialog({
        canSelectFolders: false, // 是否可以选择文件夹,只能选择文件
        canSelectMany: true, // 是否多选
        filters: {
          images: [
            'jpg',
            'png',
            'jpeg',
            'webp',
            'gif',
            'ico',
            'svg',
            'mp3',
            'mp4',
            'mov',
            'js',
            'ts',
            'vue',
            'jsx',
            'tsx',
            'json'
          ]
        }
      });
      let editorPosition = vscode.window.activeTextEditor;
      new Upload(fileList, editorPosition);
    }
  );

  context.subscriptions.push(gomeImg);
  context.subscriptions.push(cssChange);
  context.subscriptions.push(fileSelect);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
