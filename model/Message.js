/**
 * Created by hama on 2017/9/18.
 */
//用户消息表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
//将基础方法引入进来
const BaseModel = require('./base_model')
const MessageSchema = new Schema({
    /*
     * type:
     * reply: xx 回复了你的话题
     * comment: xx 在话题中回复了你
     * follow: xx 关注了你
     * at: xx ＠了你
     */
    _id:{
        type:String,
        default:shortid.generate,
        unique:true
    },
    type: { type: String,
        require:true},
    //消息发给谁
    target_id: {
        type: String,
        ref:'User',
        require:true},
    //作者的ID
    author_id: { type: String,
        ref:'User',
        require:true},
    //文章的ID
    question_id: { type: String,ref:
        'Question',
        require:true},
    //用户在回复某个人得时候 或者在回复中@
    // 某人的时候 这个时候会记录回复的ID
    comment_id:{
        type:String,
        ref:'Comment'
    },
    reply_id: {
        type: String,
        ref:'Reply',
        require:true},
    has_read: { type: Boolean, default: false },
    create_time: { type: Date, default: Date.now }

})
MessageSchema.statics = {
    getMessagesCount :(id,callback) =>{
        Message.count({'target_id':id,'has_read':false},callback)
    },
//    根据用户ID 读取未读消息
  getUnReadMessages:(id,callback)=>{
 //       多表连查
 Message.find({'target_id':id,'has_read':false},null,{sort:'-create_time'}).populate('author_id')
     .populate('target_id').populate('question_id').populate('reply_id').exec(callback)
},
    // 、根据用户id 读取已读消息
 getReadMessages:(id,callback)=>{
Message.find({'target_id':id,'has_read':true},null,{sort:'-create_time',limit:5})
    .populate('author_id').populate('target_id').populate('question_id').populate('reply_id').exec(callback)
},
    //总条数
    getAllReadMessages:(id,callback)=>{
        Message.find({'target_id':id,'has_read':true},null,{sort:'-create_time',})
            .populate('author_id').populate('target_id').populate('question_id').populate('reply_id').exec(callback)
    },
    //更新某条消息为已读
    updateMessage:(id,callback)=>{
        Message.update({'_id':id},{$set:{'has_read':true}}).exec(callback)
    },
//    更新全部消息为已读
    updateAllMessage:(user_id,callback)=>{
  Message.update({'target_id':user_id},{$set:{'has_read':true}},{multi:true}).exec(callback)
},
//    查找分页
    undateAllMessage:(user_id,id,callback)=>{
        //       多表连查
        Message.find({'target_id':user_id,'has_read':true})
            .sort({'create_time':'-1'}).populate('author_id')
            .populate('target_id').populate('question_id').populate('reply_id')
            .skip(id).limit(5).exec(callback)
    },

}
// 当前的模型会有BaseModel 里面的方法
MessageSchema.plugin(BaseModel)
const Message = mongoose.model('Message',MessageSchema);
module.exports = Message
