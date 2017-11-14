/**
 * Created by hama on 2017/9/18.
 */
//个人设置的处理函数
const  mapping = require('../static');
const formidable = require('formidable');
const moment = require('moment');
const fs = require('fs');
const gm = require('gm');
const validator = require('validator');
const User = require('../model/User');
const Question =require('../model/Question');
const Reply = require('../model/Reply');
const map = require('../static');
const Concern = require('../model/Concern')
exports.setting = (req,res,next)=>{
res.render('setting',{
    title:'用户设置页面',
    layout:'indexTemplate',
    resource:mapping.userSetting,
}
)
}
//更新头像的处理函数
//更新头像的处理函数
exports.updateImage = (req,res,next)=>{
    //初始化
    let form = new formidable.IncomingForm();
    form.uploadDir = 'public/upload/images/';
    let updatePath = 'public/upload/images/';
    let smallImgPath = "public/upload/smallimgs/";
    let files = [];
    let fields = [];
    form.on('field',function(field,value){
        fields.push([field,value]);
    }).on('file',function(field,file){
        //文件的name值
        //console.log(field);
        //文件的具体信息
        //console.log(file);
        files.push([field,file]);
        let type = file.name.split('.')[1];
        let date = new Date();
        let ms = moment(date).format('YYYYMMDDHHmmss').toString();
        let newFileName = 'img' + ms + '.' + type;
        fs.rename(file.path,updatePath + newFileName,function(err){
            var input = updatePath + newFileName;
            var out = smallImgPath + newFileName;
            gm(input).resize(100,100,'!').autoOrient().write(out, function (err) {
                if(err){
                    // console.log(err);
                }else{
                    // console.log('done');
                    //压缩后再返回，否则的话，压缩会放在后边，导致链接失效
                    return res.json({
                        error:'',
                        initialPreview:['<img src="' + '/upload/smallimgs/' + newFileName + '">'],
                        url:out
                    })
                }
            });
        })
    })
    form.parse(req);
}
//更新个人资料的处理函数
exports.updateUser = (req,res,next)=>{
    let id = req.params.id;
    let motto = req.body.motto;
    let avatar = req.body.avatar;
    let error;
    //数据验证

    if(!validator.isLength(motto,0)){
        error = '个性签名不能为空';
    }
    if(!validator.isLength(avatar,0)){
        error = '个人头像上传失败啦';
    }
    if(error){
        return res.end(error);
    }else{

        User.getUserById(id,(err,user)=>{
            console.log(user);
            if(err){
                return res.end(err);
            }
            if(!user){
                return res.end('该用户不存在');
            }
            user.update_time = new Date();
            user.motto = motto;
            user.avatar = avatar;
            console.log(user);
            user.save().then((user)=>{
                console.log(2)
                req.session.user = user;
                console.log(1)
                return res.end('success');
            }).catch(err=>{
                return res.end(err);
            })
        })
    }
}
//用户排名
exports.all = (req,res,next)=>{
    // Concern.find({'user_name':'bbbbb'}).populate('user_name').populate('following_id').populate('follow_id').then(ss=>{
    //     console.log(ss)
    // })
    User.find().sort({'score':-1}).populate('concern').then(users=>{
       // console.log(users.concern.following_id)
// console.log(users)
        res.render('users',{
            title:"用户积分",
            users:users,
            layout:'indexTemplate',
        })
    })
}
//个人信息
exports.index = (req,res,next)=>{
   let name = req.params.name
    User.getUserByName(name,(err,user)=>{
      if(err){
          // res.send(err)
          res.render('error',{
              message:'用户名不存在',
              err:err
          })
      }else{
       //   查询用户发布的问题
         Question.find({'author':user._id}).then(questions=>{
              Reply.find({'author':user._id}).sort({'create_time':1}).populate('author').populate('question_id').limit(5).then(replyss=>{
                  console.log(replyss)
                  res.render('user-center',{
                      users:user,
                      title:'个人中心',
                      questions:questions,
                      replyss:replyss,
                      layout:'indexTemplate',
                      resource:map.userCenter
                  })
              })
       });
      }
    })
}
//发布问题列表
exports.questions = (req,res,next)=>{

}
//回复问题列表
exports.replys = (req,res,next)=>{

}


