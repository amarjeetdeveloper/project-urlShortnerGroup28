const urlModel = require("../model/urlModel");
const redis = require("redis");
const shortid = require("shortid");
const { promisify } = require("util");

//value validation
const validValue = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number" && value.toString().trim().length === 0)
    return false;
  return true;
};

const validData = function (request) {
  return Object.keys(request).length > 0;
};

const validUrl = function (url) {
  const urlRegex =
    /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(url);
};

//Connect to redis
const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createUrl = async function (req, res) {
  try {
    let data = req.body;

    if (!validData(data))
      return res
        .status(400)
        .send({ status: false, message: "please provide data" });

    const { longUrl } = data;

    if (!longUrl)
      return res.status(400).send({
        status: false,
        message: "only accept longUrl please check again",
      });

    longUrl.toLowerCase().trim();

    if (!validUrl(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "please provide valid long url" });

    const urlCode = shortid.generate().toLowerCase();

    let check = await urlModel.findOne({ urlCode: urlCode });

    if (check)
      return res.status(404).send({
        status: false,
        mesage:
          "shord url alreday exist for this longurl please provide another longurl",
      });

    const baseUrl = "http://localhost:3000";

    const shortUrl = baseUrl + "/" + urlCode;

    data.shortUrl = shortUrl;
    data.urlCode = urlCode;

    await urlModel.create(data);

    let finalData = await urlModel
      .findOne({ longUrl: longUrl })
      .select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
    return res.status(201).send({ status: true, data: finalData });
  } catch (err) {
    res.status(500).send({ status: false, err: err.message });
  }
};

const getUrl = async function (req, res) {
  try {
    let data = req.params.urlCode;

    let { urlCode } = req.params;

    let cahcedUrlCode = await GET_ASYNC(`${req.params.urlCode}`);

    if (cahcedUrlCode) {
      res.send(cahcedUrlCode);
    } 
    else {
      let urlData = await urlModel.findOne({ urlCode: req.params.urlCode });
      if (!urlData)
        return res
          .status(404)
          .send({ status: false, message: "'not found urlCode'" });

      await SET_ASYNC(`${req.params.urlCode}`, (urlCode));

     return res.send({ data: urlData });
    }
    
  } catch (err) {
    res.status(500).send({ status: false, err: err.message });
  }
};

module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
