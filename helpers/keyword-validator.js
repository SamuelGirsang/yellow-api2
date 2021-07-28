module.exports = function keywordValidator(keyword) {
  const jsDate = new Date(keyword);
  const day  = ("0" + jsDate.getDate()).slice(-2);
  if (!day || !jsDate || !Date.parse(jsDate)) {
    return { status: 1, keyword };
  } else {
    const month = ("0" + (jsDate.getMonth() + 1)).slice(-2);
    const year = jsDate.getFullYear()
    return { status: 0, keyword: `${year}-${month}-${day}`};
  }
}