const urlModel = require("../model/urlModel");
const redis = require("redis");
const validUrl = require("valid-url");
const shortid = require("shortid");
const { promisify } = require("util");

//value validation

const validData = function (request) {
  return Object.keys(request).length > 0;
};

//Connect to redis
const redisClient = redis.createClient(
  18897,
  "redis-18897.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("0993s8I4FbuDIS4o4NWSUghaEePMxaEd", function (err) {
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

    let goodUrl = longUrl.toLowerCase().trim();

    if(!validUrl.isWebUri(goodUrl)) return res.status(404).send({status:false, message:"please provide valid url"})

    const baseUrl = "localhost:3000";

    if (validUrl.isWebUri(goodUrl)) {
      let getUrl = await GET_ASYNC(`${goodUrl}`);
      let url = JSON.parse(getUrl);
      if (url) {
        return res
          .status(200)
          .send({ status: true, message: "Success", data: url });
      } else {
        let urlCode = shortid.generate().toLowerCase();

        let shortUrl = baseUrl + "/" + urlCode;

        data.urlCode = urlCode;
        data.shortUrl = shortUrl;

        await urlModel.create(data);
        let saveData = await urlModel
          .findOne({ urlCode: urlCode })
          .select({ _id: 0, __v: 0 });
        await SET_ASYNC(`${goodUrl}`, JSON.stringify(saveData));
        return res.status(201).send({
          status: true,
          data: saveData,
        });
      }
    }
  } catch (err) {
    res.status(500).send({ status: false, err: err.message });
  }
};

const getUrl = async function (req, res) {
  try {
    let cacheData = await GET_ASYNC(`${req.params.urlCode}`);

    let url = JSON.parse(cacheData);

    if (url) {
      return res.status(307).redirect(url.longUrl);
    } else {
      let code = await urlModel.findOne({ urlCode: req.params.urlCode });

      if (!code)
        return res.status(404).send({ status: false, message: "No URL Found" });

      await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(code));

      return res.status(307).redirect(code.longUrl);
    }
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};

module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
