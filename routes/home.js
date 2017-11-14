/**
 * Created by hama on 2017/9/18.
 */
//静态资源的对象
const mapping = require('../static');
//验证模块
 const  validator = require('validator');
// 引入mailer  发送邮件的东西
const  mail = require('../common/mailer')
// 引入User 表模型
const  User = require('../model/User')
//引入数据库操作文件
const  DBSet = require('../model/db');
const  setting = require('../setting')
//引入权限
const auth = require('../common/auth');
const Question = require('../model/Question');
const Reply = require('../model/Reply');
const  Concern = require('../model/Concern');
//首页的处理函数
exports.index = (req,res,next)=>{
    //首页要获取的数据，所有的文章，热门的用户就可以了
    let currentPage = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 2;
    let category = req.query.category || 'all';
    let query = {};
    if(!category || category === 'all'){
        query.category = {$ne:'job'};
    }else{
        query.category = category;
    }
    let options = {skip:(currentPage - 1)*limit,limit:limit,sort:'-last_reply_time -create_time'};
    //获取到所有的文章，按照分页的形式来
    Question.getArticleByQuery(query,options,(err,articles)=>{
        if(err){
            return res.render('error',{
                message:'',
                error:err
            })
        }
        //获取分页的数据
        Question.getCountByQuery(query,(err,all_articles)=>{
            if(err){
                return res.render('error',{
                    message:'',
                    error:err
                })
            }
            let totalItem = all_articles;
            let totalPage = Math.ceil(totalItem/limit);
            let pageStart = currentPage - 2 > 0 ? currentPage - 2 : 1;
            let pageEnd = pageStart + 4 >= totalPage ? totalPage : pageStart + 4;
            let pageArr = [];
            for(let i=pageStart;i<=pageEnd;i++){
                pageArr.push(i);
            }
            let pageInfo = {
                "totalItems":totalItem,
                "currentPage":currentPage,
                "limit":limit,
                "pages":pageArr
            }
            //最后再获取到热门用户的列表
            User.find({},'',{limit:10,sort:'-score'},(err,users)=>{
                res.render('index',{
                    title:'首页--社区问答系统',
                    layout:'indexTemplate',
                    articles:articles,
                    pageInfo:pageInfo,
                    hotUsers:users,
                    category:category
                })
            })
        })
    })
}
//注册页面的处理函数
exports.register = (req,res,next)=>{

    res.render('register',{
        title:'注册页面',
        layout:'indexTemplate',
        resource:mapping.register //加载register.css
    })
}
//登录页面的处理函数
exports.login = (req,res,next)=>{
    res.render('login',{
        title:'登录页面',
        layout:'indexTemplate',
        resource:mapping.login //动态的加载login.css
    })
}
//注册行为的处理函数
exports.postRegister = (req,res,next)=>{
  // res.render('login',
  //    console.log('注册成功')
  // )
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    // console.log(password)
    let error;
  //用户名
    if(!validator.matches(name,/^[a-zA-Z][a-zA-Z0-9_]{4,11}$/,'g')){
        error = '用户名不合法,5-12位,数字字母下划线,请重新输入'
    }
    //密码
    if(!validator.matches(password,/(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/,'g') ||
        !validator.isLength(password,6,12)){
        error = '密码不合法,长度在5-12位,请重新输入'
    }
    //邮箱验证
    if(!validator.isEmail(email)){
        error = '邮箱格式不合法,请重新输入';
    }
    if(error){
        res.end(error);//如果上述验证失败，就直接将失败的提示消息发给前端.
    }else{
        console.log('2')
    //    验证成功后
        let query = User.find().or([{name:name},{email:email}]);
        //执行上面的语句
        query.exec().then(user=>{
            if(user.length > 0){
                //找到这个用户了，说明它以前注册过
                error = '不允许重复注册，请重新填写注册信息'
                res.end(error);
            }else{
                //没重复的情况，允许注册
                //发送邮件
                let regMsg = {name:name,email:email};
                mail.sendEmail('reg_mail',regMsg,err=>{
                    if(err){
                        // res.end(err);
                        console.log(err)
                    }
                });
                let newPSD = DBSet.encrypt(password,setting.psd);
                req.body.password = newPSD;
                let  newConcern = new Concern();
                req.body.concern = newConcern._id;
                console.log(newConcern)
                newConcern.save().then(conren=>{
                    // console.log(conren);
                    DBSet.addOne(User,req,res,'success');
                }).catch(err=>{
                    console.log(err)
                });


            }
        }).catch(err=>{
            res.end(err);
        })
    }
}
//登录行为的处理函数
exports.postLogin = (req,res,next)=>{
    let error;
    let name = req.body.name;
    let getEmail;//用户邮箱
    let getName;
    let getUser;//通过用户名密码来获取用户的登录信息
    let password = req.body.password;
// console.log(name)
    name.includes('@') ? getEmail = name : getName = name;
//    判断用户名是否合法
    if(getName){
        if(!validator.matches(getName,/^[a-zA-Z][a-zA-Z0-9_]{4,11}$/,'g')){
            error = '用户名格式不正确';
        }
    }
    //验证邮箱
    if(getEmail){
        if(!validator.isEmail(getEmail)){
            error = '邮箱格式不正确';
        }
    }
    //验证密码
    if(!validator.matches(password,/(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/,'g')||
        !validator.isLength(password,6,12)){
        error = '密码格式不正确';
    }
    if(error){
        res.end(error);
    }else {
          //验证成功
        if(getEmail){
            getUser = User.getUserByEmail
        }else{
            getUser = User.getUserByName
        }
        getUser(name,(err,user)=>{
            if(err){
                return res.end(err);
            }
            //你根据邮箱或者是用户名查到的用户信息
            if(!user){
                return res.end('用户名/邮箱不存在');
            }else{
                //判断密码是否一样
                let newPSD = DBSet.encrypt(password,setting.psd);
                if(user.password !== newPSD){
                    return res.end('密码错误,请重新输入');
                }
                //生成cookie
                auth.gen_session(user,res);
                return res.end('success');
            }
        })
    }
}
//退出行为的处理函数
exports.logout = (req,res,next)=>{
//
    req.session.destroy();
//    cookie 删除
    res.clearCookie(setting.auth_name);
    res.redirect('/')
}
//滚动加载
exports.ad = (req,res,next)=>{
    Question.find({'category':"ask"}).sort(2).limit(2).populate('author').populate('last_reply_author').sort('-create_time -last_reply_time').then(question=>{
        console.log(question)
        // res.render('index',{
        //     title:'首页',
        //     //默认模板文件
        //     layout:'indexTemplate',
        //     question:question,
        // })
    })
}



