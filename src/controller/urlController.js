const urlModel = require("../model/urlModel")


const createUrl = async function(req,res){
    try{
        let data = req.body
if(Object.keys(data).length == 0) return res.status(400).send({status:false, message:"please provide data"})
       if (!data.longUrl) return res.status(400).send({status:false, message:"only accept longUrl please check again"})

       


    }
    catch(err){
        res.status(500).send({status:false, err:err.message})
    }
}


const getUrl = async function(req,res){
    try{
        let data = req.body

        if(!data.longUrl) return res.status(400).send({status: false, message:"please provide longUrl"})

    }
    catch(err){
        res.status(500).send({status:false, err:err.message})
    }
}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl