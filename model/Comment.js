/**
 * Created by hama on 2017/9/18.
 */
//二级回复表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid= require('shortid');
//将基础方法引入进来
const BaseModel = require('./base_model')
const CommentSchema = new Schema({
    //二级回复的id
    _id:{
        type:String,
        default:shortid.generate,
        unique:true
    },
    //对应的一级回复的ID
    reply_id:{
        type:String,
        ref:'Reply'
    },
    //二级留言的人
    author:{
        type:String,
        ref:'User'
    },
    //二级回复的对象,默认应该是留言的作者，但是也有可能是其他二级回复的人
    comment_target_id:{
        type:String,
        ref:'User'
    },
    //文章问题ID
    question_id:{
        type:String,
        ref:'Question'
    },
    //二级回复的内容
    content:{
        type:String
    },
    //二级回复的时间
    create_time:{
        type:Date,
        default:Date.now
    },
    //同时也可以给二级留言进行点赞
    likes:{
        type:[String],
        ref:'User'
    }
})
// 当前的模型会有BaseModel 里面的方法
CommentSchema.plugin(BaseModel);
CommentSchema.statics = {
    getCommentsByReplyId: (reply_id,callback)=>{
        Comment.find({'reply_id':reply_id},'',{sort:{'create_time':'1'}}).populate('author').populate('comment_target_id').populate('' +
            'question_id').limit(5).exec(callback)
    },
    getCoomentsByReplyIds:(reply,limit,callback)=>{
        Comment.find({'reply_id':reply},'',{sort:{'create_time':1}}).skip(limit).limit(5).populate('author').populate('comment_target_id').populate('question_id').exec(callback)
    }
}
const Comment = mongoose.model('Comment',CommentSchema);
module.exports = Comment
