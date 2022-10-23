// 图片格式
const regImg = /^.*\.(jpg|jpeg|png|webp)$/i;

// tinify密钥
const tinifyKeyArr = [
  'TMcdJ3MjwvhKmNXhwczMBwJGnJQ3f75t',
  'CBCFTPTmTNDlQlh8LWWVdBZJrDv5g0WM',
  'HWRkcx2s688YKHfffSkgLShgRgB7h0Yv',
  'jkw5HSXD9ZF83j88ZvB3NSPDh4BpsTxX',
  'sKwzbt0LnT5qj4qKPscCfpYVfrcNjcPz',
  '7zhgWP1mdHsSs126MJpDjx994vncrTwd',
  'fr8G2yfTy46Jh2ssR7dzDss51QpPgmfy',
  '4yL8vt9ns4kkgDqDBwW3GSwpmyJ6282H',
  'nzL4PlvYBv74vsgxTjBMPDsXCZvLqy3X',
  'dkVJXn2lnxcK9CQ956xdQjdXg7C0PTmM',
];

// tinify，key 验证，获取压缩次数
const tinifyValidate = (tinify) => {
  return new Promise((resolve, reject) => {
    tinify.validate((err) => {
      if (err) {
        reject(err);
      }
      const count = tinify.compressionCount;
      resolve(count);
    });
  });
};

// tinify 压缩，压缩成功失败都会上传
function tinifyCompress(tinify, filPath) {
  return new Promise((resolve, reject) => {
    tinify.fromFile(filPath).toBuffer((err, resultData) => {
      if (err) {
        resolve(filPath);
      }
      resolve(resultData);
    });
  });
}

module.exports = {
  regImg,
  tinifyKeyArr,
  tinifyValidate,
  tinifyCompress
};
