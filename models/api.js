const _ = require("lodash");
const axios = require("axios");
const { redisConnection } = require("../config/redis-connection");
const { constant } = require("../common/global-constant");
const { config } = require("../config"); 

module.exports = class ApiDataModel {

  static async init() {
    this.connection = redisConnection;

    let indices = await this.connection.call('FT._LIST');

    if (indices.includes(constant.INDEX)) {
      await this.connection.call('FT.DROPINDEX', constant.INDEX)
    }

    await this.connection.call(
      'FT.CREATE', constant.INDEX,
      'ON', 'hash',
      // 'PREFIX', 1, '_id:',
      'PREFIX', 1, '_city:',
      'SCHEMA',
        'city', 'TEXT',
    )
  }


  static async covidStats (date) {
    const covidCache = await redisConnection.get(`covid-${date}`);

    const API_KEY = config.RAPID_API_KEY;
    const API_HOST = config.RAPID_API_HOST;
    const options = {
      method: "GET",
      url: config.BASE_URL_COVID_STATS,
      params: {
        date,
        region_name: constant.COUNTRY
      },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    }
    const successMessage = "Successfully fetch Covid Statistics data"

    try {
      if (covidCache !== null) {
        return {
          statusCode: 200,
          message: successMessage,
          result: JSON.parse(covidCache)
        }
      }

      const { data } = await axios.request(options);
      if (_.isEmpty(data.data)) {
        return {
          statusCode: 200,
          message: "No data records found",
          result: null
        }
      }
      let result = data.data;
      result = result.map((item) => {
        return { active: item.active, deaths: item.deaths, recovered: item.recovered };
      })
      await redisConnection.set(`covid-${date}`, JSON.stringify(result));
      return {
        statusCode: 200,
        message: successMessage,
        result
      }
        
    } catch (err) {
      console.log(err)
      return {
        statusCode: err.response.status,
        message: err.response.data.message ? err.response.data.message : "Bad Request",
        result: null
      }
    }
  }

  static async filterWeatherApi (keywordsInput) {
    keywordsInput = keywordsInput.toLowerCase().replace(/[^\w\s]/gi, "").split(" ").filter((keyword) => { return keyword.length > 2});
    let result = { current: [], forecast: [] }
    
    let weatherKeyword = keywordsInput.map(async (keyword) => {
      if (keyword === 'give') return
      if (keyword === 'forecast' || keyword === 'weather') return keyword;
      const data = await this.connection.hgetall(`_city:${keyword}`);
      if (_.isEmpty(data)) return 
      return data.city
    })

    weatherKeyword = await Promise.all(weatherKeyword);
    weatherKeyword = weatherKeyword.filter((el) => { return !_.isEmpty(el) } );
    weatherKeyword.map((el, i) => {
      if (el === 'forecast') {
        result.forecast.push(weatherKeyword[i+1])
      }
      if (el === 'weather')  {
        result.current.push(weatherKeyword[i+1])
      } else {
        result.current.push(weatherKeyword[i])
      }

    })

    if (!result.current.length && !result.forecast.length) {
      return {
        statusCode: 400,
        message: 'Invalid keyword for weather API',
        result: null
      }
    }

    const response = await this.weatherApi(result);
    return {
      statusCode: 200,
      message: "Successfully fetch Weather data",
      result: response
    }
  }

  static weatherUrls (weatherQuery) {
    const BASE_URL_CURRENT = config.BASE_URL_WEATHER_CURRENT;
    const BASE_URL_FORECAST = config.BASE_URL_WEATHER_FORECAST;
    const API_KEY = config.API_KEY_WEATHER;

    let request = [];

    if (weatherQuery.current.length) {
      weatherQuery.current.map((item) => {
        request.push(`${BASE_URL_CURRENT}?key=${API_KEY}&q=${item}`)
      })
    }
    if (weatherQuery.forecast.length) {
      weatherQuery.forecast.map((item) => {
        request.push(`${BASE_URL_FORECAST}?key=${API_KEY}&q=${item}`)
      })
    }

    return request;
  }

  static async weatherApi (weatherParams) {
    const requests = this.weatherUrls(weatherParams);
    try {
      return axios.all(requests.map((request) => axios.get(request))).then(axios.spread((...responses) => {
        const result = responses.map(({ data }) => {
          return data
        })
        return result
      }))

    } catch (err) {
      console.log(err)
    }
  }

}