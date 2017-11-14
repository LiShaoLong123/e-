/**
 * Created by hama on 2017/9/18.
 */
//问题表
const mongoose = require('mongoose');
const shortid = require('shortid');
const _ = require('lodash');
const setting = require('../setting')
//将基础方法引入进来
const BaseModel = require('./base_model')
//生成一个较短的ID
const Schema = mongoose.Schema;
const QuestionSchema = new Schema({
    _id:{
        type:String,
        default:shortid.generate,
        unique:true
    },
    //文章的标题
    title:{
        type:String,
        require:true
    },
    //文章的内容
    content:{
        type:String,
        require:true
    },
    //创建时间
    create_time:{
        type:Date,
        default:Date.now
    },
    //修改时间
    update_time:{
        type:Date,
        default:Date.now
    },
    //标签
    tags:String,
    //点击量
    click_num:{
        type:Number,
        default:0,
    },
    //回复量
    comment_num:{
        type:Number,
        default:0,
    },
    //关注量
    follow_num:{
        type:Number,
        default:0,
    },
    //作者,它应该一个user表中的数据
    author:{
        type:String,
        ref:'User' //文章的作者
    },
    //文章的分类
    category:{
        type:String,
        require:true
    },
    //最后的回复
    last_reply:{
        type:String,
        ref:'Reply' //最后回复的帖子
    },
    //最后回复的时间
    last_reply_time:{
        type:Date,
        default:Date.now
    },
    //最后回复的那个人
    last_reply_author:{
        type:String,
        ref:'User'
    },
    //增加删除功能
    deleted:{
        type:Boolean,
        default:false
    },

})
//
QuestionSchema.virtual('categoryName').get(function () {
    let category = this.category;
    // console.log(category)
    let pair = _.find(setting.categorys,function (item) {
        return item[0] == category;
    })
    if(pair){
        return pair[1];
    }else {
        return '';
    }
})
QuestionSchema.statics = {
    getFullQuestion :(id,callback)=>{
        //暂时不去查询last_reply 信息
        Question.findOne({'_id':id},{'deleted':false}).populate('author')
            .populate('last_reply_author').exec(callback)
},
    //获取作者其他文章列表
    getOtherQustions :(author,question_id,callback)=>{
  Question.find({'author':author,'_id':{$nin:[question_id]}}).limit(5).sort({'last_reply_time':-1,'create_time':-1}).exec(callback)
    },
    // 通过id 来查询一个问题
    getQuestionById:(id,callback)=>{
        Question.findOne({'_id':id}).populate('author').exec(callback)
    },
//    根据条件获取文章列表
    getArticleByQuery:(query,opt,callback)=> {
        query.deleted = false;
        Question.find(query,{},opt).populate('author').populate('last_reply').populate('last_reply_author').then((articles)=>{
            if(articles.length == 0){
                return callback(null,[]);
            }
            //如果这篇文章的作者已经被删除，那么它这篇文章应该也设置为空
            //暂时先不做这方面的工作，因为感觉现在还没必要
            return callback(null,articles);
        }).catch(err=>{
            return callback(err);
        })
    },
    getCountByQuery:(query,callback)=>{
        Question.count(query).then((all_articles)=>{
            return callback(null,all_articles);
        }).catch(err=>{
            return callback(err);
        })
    }
}
QuestionSchema.plugin(BaseModel)
const Question = mongoose.model('Question',QuestionSchema);
module.exports = Question
