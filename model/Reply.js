/**
 * Created by hama on 2017/9/18.
 */
//一级回复表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid')
//将基础方法引入进来
const BaseModel = require('./base_model')
const ReplySchema = new Schema({
    _id:{
        type:String,
        default:shortid.generate,
        unique:true
    },
    //留言的内容
    content:{
        type:String,
        require:true,
    },
    //留言的人
    author:{
        type:String,
        require:true,
        ref:'User' //关联用户表
    },
    //留言的时间
    create_time:{
        type:Date,
        default:Date.now
    },
    //二级回复id
    reply_id:{
        type:String
    },
    //留言的对应文章
    question_id:{
        type:String,
        ref:'Question'
    },
    //增加点赞功能
    likes:{
        type:[String],
        ref:'User'
    },
    //二级回复的数量
    comment_num:{
        type:Number,
        default:0,
    }
})
//更改时间格式
ReplySchema.plugin(BaseModel)
ReplySchema.statics = {
    //获取文章所有回复
    getRepliesByQuestionIds:(question_id,callback)=>{
     Reply.find({'question_id':question_id}).sort({'create_time':1}).populate('author').exec(callback)
        },
    //获取五条
    getRepliesByQuestionId:(question_id,callback)=>{
        Reply.find({'question_id':question_id}).sort({'create_time':1}).limit(5).populate('author').exec(callback)
    }
}
const Reply = mongoose.model('Reply',ReplySchema);
module.exports = Reply
