/**
 * Created by hama on 2017/9/18.
 */
//新建问题的处理函数
    const  validator = require('validator')
    const  setting = require('../setting');
    //引入表
    const  User = require('../model/User')
    const Question = require('../model/Question')
    const  mapping = require('../static')
    const Reply = require('../model/Reply')
    const  at = require('../common/at')
    const Comment = require('../model/Comment');
    const Concern = require('../model/Concern')

//
exports.create = (req,res,next)=>{
    res.render('create-question',{
        title:'新建--社区问答系统',
        layout:'indexTemplate',
        category:setting.categorys
    })
}
//新建行为的处理函数
exports.postCreate = (req,res,next)=>{
     let title  = validator.trim(req.body.title);
     let  category = validator.trim(req.body.category);
     let content = validator.trim(req.body.content);
     let error;

    if(!validator.isLength(title,{min:10,max:50})){
        error = '文章的标题长度不能少于10个字符或者多于50个字符'
    }
    if(!validator.isLength(content,0)){
        error = '文章的内容不能为空';
    }
    if(error){
        res.end(error);
    }else{
       req.body.author= req.session.user._id;
        let newQuestion = new Question(req.body);
        newQuestion.save().then(question=>{
            User.getUserById(req.session.user._id,(err,user)=>{
                user.score += 5;
                user.article_count += 1;
                user.save();
                req.session.user = user;
                //返回的是一个添加问题的页面地址
                res.json({url:`/question/${question._id}`});
            })
            at.sendMessageToMentionUsers(content,question._id,req.session.user._id,(err,msg)=>{
            });
        }).catch(err=>{
            return res.end(err)
        })
    }
}
//编辑问题的处理函数
exports.edit = (req,res,next)=>{
     let question_id = req.params.id
    Question.getQuestionById(question_id,(err,question)=>{
         if(err){
             res.reader('error',{
                 err:'出错了',
                 message:'文章不存在或被删除'
             })
         }

         res.render('edit-question',{
             title:'编辑文章',
             layout:'indexTemplate',
             question:question,
             categorys:setting.categorys,

         })
    })

}
//编辑行为的处理函数
exports.postEdit = (req,res,next)=>{
   let question =  req.params.id;
    let title = validator.trim(req.body.title);;
   let content = validator.trim(req.body.content);
   let category= validator.trim(req.body.category);
     Question.getFullQuestion(question,(err,question)=>{
         if(err){
             res.render('error',{
                 err:'出错了',
                 message:'文章不存在或被删除'
             })
         }else {
             //发送at 消息
             at.sendMessageToMentionUsers(content,question._id,req.session.user._id,(err,msg)=>{
             });
             content =  at.linkUsers(content)
             question.category= category;
             question.title = title;
             question.content = content;
             question.update_time = new Date()
             question.save().then(question=>{
                 res.json({url:`/question/${question._id}`});
             }).catch(err=>{
                       console.log(err)
             });

         }
     })
}
//删除行为的处理函数
exports.delete = (req,res,next)=>{
   let  question_id = req.params.id
    console.log(question_id);
   Comment.find({'question_id':question_id}).then(function (aaa) {
       console.log(aaa)
   })
}
//查询问题的处理函数
exports.index = (req,res,next)=>{
        //问题的id
        let question_id = req.params.id;
        //当前登录的信息
        let currentUser = req.session.user;
            //问题信息
            //问题的回复信息
            //当前文章的其他相关文章推荐
        Question.getFullQuestion(question_id,(err,question)=>{
                    if(err){
                             return   res.end(err);
                              }
                    if(question == null){
                        res.render('error',{
                            title:'错误页面',
                            resource:mapping.userSetting,
                            message:'该问题不存在或被删除',
                            error:'',
                            layout:'indexTemplate'
                        })
                    }
        //            给问题的内容 如果有@  给@用户添加一个链接
                question.content = at.linkUsers(question.content);
                    //问题的访问量+1
                question.click_num += 1
                question.save();
            //   获取文章的回复信息  可以在此处想想分页  ....
            //reply 表对应信息
            //文章查询五条
            Reply.getRepliesByQuestionId(question._id,(err,replies)=>{
                // console.log(replies.)
                if (replies.length > 0 ){
                    replies.forEach((reply,index)=>{
                        reply.content = at.linkUsers(reply.content)
                    })
                }
                // console.log(replies)
                //问题的详情页面
                Question.getOtherQustions(question.author._id,question._id,(err,questions)=>{
                    // console.log(question)
                       Concern.findOne({'_id':question.author.concern}).then(concern=>{
                           res.render('question',{
                               title:'问题详情页面',
                               layout:'indexTemplate',
                               question:question,
                               others:questions,
                               replies:replies,
                               gz:concern.following_id
                       })

                    })
                })
            })
            //获取问题作者其他的文章

        })
}

//查看全部回复的处理函数
exports.replyAll = (req,res,next)=>{
    //    问题的id
    let id =  req.params.id;
    // console.log(id)
    Reply.getRepliesByQuestionIds(id,(err,repliess)=>{
        if(repliess.length > 0){
            repliess.forEach(function (reply,index) {
                reply.content = at.linkUsers(reply.content);
            })
            res.render('reply_list',{
                repliess:repliess,
                layout:'',
            })
        }
    })
}
//关注问题的处理函数
exports.focused =(req,res,next)=>{
      let    question_id = req.params.question
        let user = req.session.user._id
           Question.getQuestionById(question_id,(err,question)=>{
               if(err){
                   console.log(err)
               }
               User.getUserById(user,(err,users)=>{
                   if( users.attention.indexOf(question_id) ==-1){
                       users.attention.push(question_id);
                       question.follow_num +=1
                       users.save();
                       question.save();
                       res.end('success')
                   }else {
                       let index =  users.attention.indexOf(question_id)
                       users.attention.splice(index,1);
                       question.follow_num -=1;
                       users.save();
                       question.save();
                       res.end('off')
                   }
               })

           })

}