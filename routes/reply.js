/**
 * Created by Administrator on 2017/10/12.
 */
const  Reply = require('../model/Reply');
const validator = require('validator');
const Qustion = require('../model/Question');
const at= require('../common/at');
const User = require('../model/User')
const message = require('../common/message')
exports.add = (req,res,next)=>{
//    存在Reply 表
    let question_id = req.params.question_id;
    let content = req.body.content;
      content = validator.trim(String(content))
    if(content == ''){
        return  res.end('内容不能为空')
    }
    //    存到Reply 表
    let newReply = new Reply();
    newReply.content = content;
    newReply.question_id = question_id;
    newReply.author = req.session.user._id;
    //存入reply表
    newReply.save().then(reply=>{
      //  查到相关信息  返回
      let result =  Reply.findOne({'_id':reply._id}).populate('question_id').populate('author')
        return result
    }).then(reply=>{
        // 更新question 表里面的消息
        reply.question_id.last_reply = reply._id;
        reply.question_id.last_reply_author = reply.author;
        reply.question_id.last_reply_time = new Date();
        reply.question_id.comment_num += 1;
        reply.question_id.save();
        return reply
    }).then(reply=>{
    // //  @ 某个人 要给这个人发送消息
    // //    不能@ 问题的作者
                   User.findOne({'_id':reply.question_id.author}).then(author=>{
                                      let author_name = author.name;
                                      let regex = new RegExp('@' + author_name + '\\b(?!\\])', 'g')
                                      let newContent = content.replace(regex,'')
                                         at.sendMessageToMentionUsers(newContent,reply.question_id._id,reply.author._id,reply._id,(err,msg)=>{
                                                       if(err){
                                                           res.end(err)
                                                       }
                                         })
                           })
                 return reply
             }).then(reply=>{
    //    4  将留言的用户  积分+5  回复数加1   并且更新session
                    reply.author.score +=1
                    reply.author.reply_count +=1;
                    reply.author.save();
                  req.session.user =  reply.author;
                // console.log(req.session.user)
                  return reply
            }).then(reply=>{
               // 给文章作者发消息    有人回复了
               //如果当前作者给自己文章回复是不能发消息的
                   let question_author = reply.question_id.author;
                   // console.log(question_author)
                   if(question_author != req.session.user._id){
                   //    发消息
                       message.sendReplyMessage(question_author,req.session.user._id,reply.question_id._id,reply._id)
                   }
                     return res.json({message:'success'})
            }).catch(err=>{
                res.end(err)
    })
}

//点赞
exports.like = (req,res,next)=>{
    let reply_id = req.params.reply_id
    let user = req.session.user._id;
     console.log(reply_id);
    Reply.findOne({'_id':reply_id}).then(reply=>{
        if(reply.likes == ''){
            reply.likes.push(user);
            reply.save();
            return res.end('like')
        }else{
            let index = reply.likes.indexOf(user)
            if(index==-1){
                reply.likes.push(user) ;
                reply.save();
                return res.end('like')
            }else {
                reply.likes.splice(index,1);
                reply.save();
                return res.end('unlike')
            }
        }
        reply.likes.push()
    })
}
