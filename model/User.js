//用户信息表
const mongoose = require('mongoose');
//引入shortid生成ID的插件
const shortid = require('shortid');
//插入 User
// const  User = require('../model/User')
//将基础方法引入进来
const Concern = require('../model/Concern')
const BaseModel = require('./base_model')
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    //定义字段
    _id:{
        type:String,
        default:shortid.generate,
        unique:true
    },
    //用户名
    name:{
        type:String,
        required:true,
    },
    //密码
    password:{
        type:String,
        required:true
    },
    //邮箱
    email:{
        type:String,
        required:true
    },
    //个人简介
    motto:{
        type:String,
        default:'这家伙很懒,什么都没有留下...'
    },
    //个人头像
    avatar:{
        type:String,
        default:'/images/default-avatar.jpg'
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
    //用户的积分
    score:{
        type:Number,
        default:0
    },
    //用户发表的文章数量
    article_count:{
        type:Number,
        default:0
    },
    //用户回复的数量
    reply_count:{
        type:Number,
        default:0
    },
    // 关注:
    concern:{
        type:String,
        default:'',
        ref:'Concern'
    },
    // 文章的关注
    attention:{
        type:[],
        default:[],
        ref:'Question'
    }

})
//给这个User添加一个静态办法
UserSchema.statics = {
     getUserByName:(name,callback)=>{
        User.findOne({'name':name},callback);
    },
    getUserByEmail:(email,callback)=>{
        User.findOne({'email':email},callback);
    },
    getUserById:(id,callback)=>{
        User.findOne({'_id':id},callback);
    },
    getUsersByNames:(names,callback)=>{
        if(names.length == 0){
            return callback(null,[]);
        }
        //$in 包含 nemes 里有的字段  都会差出来
        User.find({'name':{$in:names}},callback);
    },

}
UserSchema.plugin(BaseModel)
const User = mongoose.model('User',UserSchema);
module.exports = User
