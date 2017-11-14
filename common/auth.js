/**
 * Created by Administrator on 2017/9/26.
 */
const  setting = require('../setting');
const  User = require('../model/User');
const Message = require('../model/Message');
const  auth= {
    //判断未登录的中间件
    userRequied:(req,res,next)=>{
        if(!req.session || !req.session.user || !req.session.user._id ){
            return res.status(403).send('forbidden!');
        }
        next();
     },
    //判断以登录的中间件
    userNotRequied:(req,res,next)=>{
       if(req.session.user != undefined){
           res.status(403).send('已经登录');
       }
        next();
    },
    gen_session: (user, res) => {
        let auth_user = `${user._id}$$$$`;
        res.cookie(setting.auth_name, auth_user, {
            path: '/',
            signed: true,//对coolie 密码进行加密 需要使用cookParser
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
    },
    authUser: (req,res,next) => {
        //     中间件  所有请求都要经过它   我们在这判断登录情况
        if (req.session.user) {

            Message.getMessagesCount(req.session.user._id,(err,count)=>{
                req.session.msg_count = count;
                next();
            })

        } else {
            //    通过cookie 去生成session
            //    获取cookie
            //    通过cookie 生成session
            //    结束
            let auth_token = req.signedCookies[setting.auth_name];//cookuepaser 直接帮我解密了
            if(!auth_token){
                 next();//用户没有cookie
            }else {
                   //通过cookie 生成session
                let auth = auth_token.split('$$$$');
                let user_id = auth[0];
        //    通过id  查找
                User.findOne({_id:user_id},(err,user)=>{
                if(err){
                    return res.end(err)
                }else {
                    if(!user){
                        next();
                    }   else {
                        // 3 结束
                        //查询出用户的消息数量
                        Message.getMessagesCount(user._id,(err,count)=>{
                            req.session.msg_count = count;
                            req.session.user =  user ;
                            next();
                        })
                    }
                }
                })
            }
        }
    }
}
module.exports = auth