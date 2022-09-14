
var regexStr = '([0-9]*\\.?[0-9]+)(?=px)';
let regexExp = new RegExp(regexStr, 'g');

// h5 css像素转换
const changeCss = (val) => {
  let css = val.replace(regexExp, (match) => {
    const pureNum = match.trim();
    // 像素是0或者1不转换
    if (pureNum === '0' || pureNum === '1') {
      return ` ${pureNum}`;
    }
    // 四舍五入
    return Math.round(pureNum / 2);
  });
  return css;
};

module.exports = {
  changeCss,
};
