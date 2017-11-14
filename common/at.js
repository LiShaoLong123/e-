/**
 * Created by Administrator on 2017/9/30.
 */
// const Message = require('../model/Message')
const _ = require('lodash');
const  User = require('../model/User');
const message = require('./message')
const at= {
    fetchUsers :text=>{
        if(!text){
            return [];
        }
        //过滤
        let ignoreRegexs = [
            /```.+?```/g, // 去除单行的 ```
            /^```[\s\S]+?^```/gm, // ``` 里面的是   标签内容
            /`[\s\S]+?`/g, // 同一行中，`some code` 中内容也不该被解析
            /^    .*/gm, // 4个空格也是 pre 标签，在这里 . 不会匹配换行
            /\b\S*?@[^\s]*?\..+?\b/g, // somebody@gmail.com 会被去除
            /\[@.+?\]\(\/.+?\)/g, // 已经被 link 的 username
        ]
        //循环过滤所有的正则规则 将过滤后的文章内容 重新复制给text
        ignoreRegexs.forEach(function (ignore_regex) {
            //
            text = text.replace(ignore_regex, '');
        });
        //返回一个数组
        let results = text.match(/@[a-z0-9\-_]+\b/igm);
        let names = [];
        if(results){
            for (let i = 0, l = results.length; i < l; i++) {
                let s = results[i];
                //remove leading char @
                // slice 去除几个参数
                s = s.slice(1);
                //输出到names
                names.push(s);
            }
        }
        //去除重复  保证唯一
        names = _.uniq(names);
        return names;
    },
    sendMessageToMentionUsers: (text,questionId,authorId,replyId,commentId,callback)=>{
        //不传replyId和commentId的情况
        if(typeof replyId == 'function'){
            callback = replyId;
            replyId = null;
            commentId = null;
        }
        //不传commentId的情况
        if(typeof commentId == 'function'){
            callback = commentId;
            commentId = null;
        }
        callback = callback || _.noop();
        User.getUsersByNames(at.fetchUsers(text),(err,users)=>{
            if(err||!users){
                return callback(err);
            }
            //不能@ 作者自己

            users = users.filter((user)=>{
                // console.log(authorId,user._id)
                return user._id !== authorId;
            });
            // console.log(users)
            //如果users 为空 就没必要创建必要的消息
            //循环所有的目标用户 将消息存入消息表中
            if(users.length !=0 ){
                users.forEach((user)=>{
                    message.sendAtMessage(user._id,questionId,authorId,replyId,(err,msg)=>{
                        //这里面暂时还不知道要不要传入msg这个信息,感觉应该不需要,callback里面可能
                        //只需要处理下错误就可以了.
                        //成功的回调函数
                             if(err){
                                callback(err)
                             }else {
                                 callback(null,msg)
                             }
                        callback();
                        //这里每次都会执行多次，暂时先留着解决吧....
                    })
                })
            }
        })
    },
    linkUsers:(text)=>{
        let users = at.fetchUsers(text);
        // console.log(users);
    //    循环@ 人名数组
        if(users.length == 0){
                 return text
        }else {
            for(let i = 0; l = users.length,i<l;i++){
                let name = users[i];
                text = text.replace(new RegExp('@' + name + '\\b(?!\\])', 'g'), '[@' + name + '](/user/' + name + ')')
                }
            return text;
        }

    }
}
module.exports = at