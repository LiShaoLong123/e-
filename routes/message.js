/**
 * Created by hama on 2017/9/18.
 */
//消息列表的处理函数
const  mapping = require('../static')
const  Message = require('../model/Message')
exports.index = (req,res,next)=>{
    //未读消息和已读消息两种消息分别查询出来，放到这个页面里面去
    //读取的是当前登录用户的已读消息和未读消息
    //未读消息
    let mission1 = new Promise((resolve,reject)=>{
        Message.getUnReadMessages(req.session.user._id,(err,undatalist)=>{
            if(err){
                reject(err);
            }else{
                // console.log(undatalist)
                resolve(undatalist);
            }
        })
    })
    //已读消息
    let mission2 = new Promise((resolve,reject)=>{
        Message.getReadMessages(req.session.user._id,(err,datalist)=>{
            if(err){
                reject(err);
            }else{
                resolve(datalist);
            }
        })
    })
    //未读消息总条数
    let mission3 = new Promise((resolve,reject)=>{
        Message.getAllReadMessages(req.session.user._id,(err,alldatalist)=>{
            if(err){
                reject(err);
            }else{
                resolve(alldatalist);
            }
        })
    })

    Promise.all([mission1,mission2,mission3]).then((result)=>{
        let read = result[1];
        let no_read = result[0];
        let all_no_read = result[2];
        // console.log( no_read )
        // console.log( read )
        // console.log( all_no_read );
        res.render('message-list',{
            title:'消息列表',
            layout:'indexTemplate',
            no_read:no_read,
            read:read,
            all_no_read:all_no_read,
        })
    }).catch(err=>{
        console.log(err);
    })
}
//更新某个消息的处理函数
exports.updateMessage = (req,res,next)=>{
    let id =  req.params.id;
    Message.updateMessage(id,(err,result)=>{
        if(err){
            return res.end(err);
        }
        res.end('success')
        // console.log(result)
    })
}
//已读所有消息的处理函数
exports.updateAllMessage = (req,res,next)=>{
    let user_id = req.session.user._id;
Message.updateAllMessage(user_id,(err,result)=>{
    if(err){
        return res.end(err)
    }
    res.end('success')
})
}
//分页跳转的处理函数
exports.undateAllMessage = (req,res,next)=>{
    let id = (req.params.id-1)*5;
    let user_id = req.session.user._id
    Message.undateAllMessage(user_id,id,(err,messages)=>{

        res.render('show-message',{
            messages:messages,
            layout:'',
        })
    })

}