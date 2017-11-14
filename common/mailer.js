/**
 * Created by Administrator on 2017/9/25.
 */
 const  nodemailer = require('nodemailer');
const setting = require('../setting');
 const  mail = {
     //用来发送激活邮件
     sendEmail:(type,regMsg,callback)=>{
         //需要准备的用户名和发送的目标邮箱
         //要发送的用户名和邮箱
         const name = regMsg.name;
         const email = regMsg.email;
         //创建SMTP服务

         const transporter = nodemailer.createTransport({
             service:'163',
             // host:'163',
             auth:{
                 user:'drango123@163.com',
                 pass:'LS960520',
             }
         })
         //发送的配置参数
         const mailOptions = {
             sender:'122',
             from:setting.mail_opts.auth.user, //发送者的邮箱
             to: email, // 接收者的邮箱
             subject: `${setting.name}恭喜您,注册成功`, // 发送的主题
             text: `全球最大钓鱼网`, // 发送的标题
             html: `<b>恭喜${name}注册成功,请登录体验吧!</b>` // 发送的内容
         };
         //发送行为
         transporter.sendMail(mailOptions, (error, info) => {
             if(error){
                 callback(error);
             }
             callback(info);
         });
     }
 }
 module.exports = mail