const ApiDataModel = require("../models/api");
const keywordValidator = require("../helpers/keyword-validator");

module.exports = class ApiController {
  
  static async fetch (req, res) {
    const keywords = keywordValidator(req.query.keyword);
    if (!keywords.status) {
      const result = await ApiDataModel.covidStats(keywords.keyword)
      return res.status(200).json(result);
    }
    const result = await ApiDataModel.filterWeatherApi(keywords.keyword)
    return res.status(200).json(result);
  }
  
  
}