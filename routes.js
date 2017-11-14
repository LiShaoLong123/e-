/**
 * Created by hama on 2017/9/18.
 */
//路由文件
const express = require('express');
const router = express.Router();
//引入首页的处理函数
const home = require('./routes/home');
//引入问题的处理函数
const question = require('./routes/question');
//引入用户的处理函数
const user = require('./routes/user');
//引入消息的处理函数
const message = require('./routes/message');
const auth = require('./common/auth');
const comment = require('./routes/comment')
//引入一级回复的处理函数
const reply = require('./routes/reply');
//引入关注
const gz = require('./routes/gz');
//************************************首页***************************************
//首页的路由
router.get('/',home.index);
//注册页面的路由
router.get('/register',auth.userNotRequied,home.register);
//登录页面的路由
router.get('/login',auth.userNotRequied,home.login);
//注册行为
router.post('/register',auth.userNotRequied,home.postRegister);
//登录行为
router.post('/login',auth.userNotRequied,home.postLogin);
//退出行为
router.get('/logout',home.logout);
//首页的加载
router.get('/index/ad',home.ad)
//**************************************问题***********************************
//发布问题的页面
router.get('/question/create',auth.userRequied,question.create);
//发布问题的行为
router.post('/question/create',auth.userRequied,question.postCreate);
//编辑问题的页面
router.get('/question/:id/edit',auth.userRequied,question.edit);
//编辑问题的行为
router.post('/question/:id/edit',auth.userRequied,question.postEdit);
//删除问题的行为
router.get('/question/:id/delete',auth.userRequied,question.delete);
//问题页面
router.get('/question/:id',question.index);
//查看全部回复的行为
router.get('/undateAllMessage/:id',question.replyAll)


//****************************************用户**********************************
//个人设置页面
router.get('/setting',auth.userRequied,user.setting);
//更新头像
router.post('/updateImage',auth.userRequied,user.updateImage);
//更新个人资料
router.post('/updateUser/:id',auth.userRequied,user.updateUser);
//用户列表页面
router.get('/users',auth.userRequied,user.all);
//个人中心页面
router.get('/user/:name',auth.userRequied,user.index);
//用户发问列表
router.get('/user/:name/questions',auth.userRequied,user.questions);
//用户回复列表
router.get('/user/:name/replys',auth.userRequied,user.replys);
//**************************************消息*************************************
//消息列表页面
router.get('/my/messages',auth.userRequied,message.index);
//确认已读行为
router.get('/updateMessage/:id',auth.userRequied,message.updateMessage);
//确认全部已读行为
router.get('/updateAllMessage',auth.userRequied,message.updateAllMessage);
//分页行为的处理
router.get('/undateAllMessage/:id',auth.userRequied,message.undateAllMessage)

// ************************** 留言回复*******************************************
router.post('/:question_id/reply',auth.userRequied,reply.add)
//二级回复
router.post('/:question_id/comment',auth.userRequied,comment.add)
//二级回复的获取
router.get('/:reply_id/showComments',auth.userRequied,comment.show)
//二级回复的分页获取
router.get('/:reply_id/:limit/loading',auth.userRequied,comment.loadingShow)
//*************************************关注********************************************
router.post('/gz/:name',auth.userRequied,gz.one)
// router.post('/qg/:name',auth.userRequied,gz.two)
//一级回复点赞
router.post('/:reply_id/like',auth.userRequied,reply.like);

//问题关注
router.post('/problem-focused/:question',auth.userRequied,question.focused)
module.exports = router;

