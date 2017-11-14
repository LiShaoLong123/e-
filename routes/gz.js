/**
 * Created by Administrator on 2017/10/21.
 */
const Concern = require('../model/Concern');
const User = require('../model/User')
exports.one = (req,res,next)=>{
    // 要关注人得名称
          let  name  =    req.params.name
    //当前登录的人得信息
        let id = req.session.user._id;
          let username = req.session.user.name;
       User.getUserById(id,(err,user)=>{
           if(name == username){
           }else {
               if(user){
                   Concern.findOne({'_id':user.concern}).then(concern=>{
                       if(concern.follow_id == ''){
                           concern.follow_id = name ;
                           concern.save();
                           return res.end('success')
                       }else{
                           let index =  concern.follow_id.indexOf(name)
                           if(index==-1){
                               concern.follow_id.push(name) ;
                               concern.save();
                               return res.end('success')
                           }else {
                               concern.follow_id.splice(index,1);
                               concern.save();
                               return res.end('err')
                           }
                       }
                   })
                   User.getUserByName(name,(err,name)=>{
                       Concern.findOne({'_id':name.concern}).then(concern=>{
                           if(concern.following_id==''){
                               concern.following_id = username ;
                               concern.save();
                           }else {
                               let index =  concern.following_id.indexOf(username)
                               if(index==-1){
                                   concern.following_id.push(username) ;
                                   concern.save();
                               }else {
                                   concern.following_id.splice(index,1);
                                   concern.save();
                               }
                           }
                       })
                   })
               }
           }
    })
}
