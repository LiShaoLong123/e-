/**
 * Created by hama on 2017/6/1.
 */
//工具类
const bcrypt = require('bcryptjs');
const moment = require('moment');
//输出的格式为中文
moment.locale('zh-cn'); // 使用中文
// 格式化时间
exports.formatDate = (date, friendly)=> {
    date = moment(date);
    if (friendly) {
        //从当前时间开始算
        return date.fromNow();
    } else {
        return date.format('YYYY-MM-DD HH:mm');
    }

};

// exports.validateId = function (str) {
//     return (/^[a-zA-Z0-9\-_]+$/i).test(str);
// };
//
// exports.bhash = function (str, callback) {
//     bcrypt.hash(str, 10, callback);
// };
//
// exports.bcompare = function (str, hash, callback) {
//     bcrypt.compare(str, hash, callback);
// };