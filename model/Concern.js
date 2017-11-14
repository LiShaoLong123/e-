/**
 * Created by hama on 2017/5/22.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
const User = require('../model/User')
const ConcernSchema = new Schema({
     _id:{
         type:String,
         default:shortid.generate,
       //id经常会被查询，所以，把ID作为索引
         unique:true,
     },
    follow_id:{
        type:[],
        ref:'User'
    },
    //被关注的人
    following_id:{
        type:[],
        ref:'User'
    }
})
ConcernSchema.statics ={
    getId:(id,callback)=>{
        Concern.findOne({'_id':id},callback)
    }
}
const Concern = mongoose.model('Concern',ConcernSchema);
module.exports = Concern