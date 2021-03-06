/**
 * Created by hama on 2017/9/18.
 */
//数据库连接操作


const mongoose = require('mongoose');
//引入数据库配置参数文件
const setting = require('../setting');
const url = require('url');
const  crypto = require('crypto')
//这句话说明我们使用的promise对象是ES6中原生的promise对象.
mongoose.Promise = global.Promise;
//调用模块下面的connect方法去连接数据库
mongoose.connect(`mongodb://${setting.host}/${setting.db}`, {
    useMongoClient: true,
    /* other options */
});//应用了一下模块字符串
const DBSet = {
    //通用的新增方法
    addOne:(obj,req,res,logMsg)=>{
        let newObj = new obj(req.body);
        newObj.save().then(result=>{
            res.end(logMsg);
        }).catch(err=>{
            res.end(err);
        })
    },
    //删除的通用方法
    delOne:(obj,req,res,logMsg)=>{
        let url = url.parse(req.url,true);
        let targetId = url.params.query.id;
        obj.remove({_id:targetId}).then(result=>{
            res.end(result);
        }).catch(err=>{
            res.end(err);
        })
    },
    //通用的修改方法
    updateOne:(obj,req,res,logMsg)=>{
        let url = url.parse(req.url,true);
        let targetId = url.params.query.id;
        req.body.update_time = new Date();
        let update = {$set:req.body};
        obj.update({_id:targetId},update).then(result=>{
            res.end(result);
        }).catch(err=>{
            res.end(err);
        })
    },
    //通用的添加方法
    findOne:(obj,req,res,logMsg)=>{
        let url = url.parse(req.url,true);
        let targetId = url.params.query.id;
        obj.findOne({_id:targetId}).then(result=>{
            res.end(result);
        }).catch(err=>{
            res.end(err);
        })
    },
    encrypt:(data,key)=>{
        let ciplher = crypto.createCipher('bf',key);
        let newPsd = '';
        newPsd += ciplher.update(data,'utf-8','hex');
        newPsd +=ciplher.final('hex');
        return newPsd
   }
}
module.exports = DBSet