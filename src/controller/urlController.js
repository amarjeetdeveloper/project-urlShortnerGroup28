// const urlModel = require("../model/Url Model")

const createUrl = async function(req,res){
    try{
        let data = req.body
        if(Object.keys(data).length == 0) return res.status(400).send({status:false, message:"please provide data in body"})
        if(!data.longUrl) return res.status(400).send({status: false, message:""})
        console.log(data)
    }
    catch(err){
        res.status(500).send({status:false, err:err.message})
    }
}

module.exports.createUrl = createUrl