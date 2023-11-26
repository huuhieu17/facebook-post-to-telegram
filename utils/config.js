const env = process.env;
const listGroups = [
    'https://mbasic.facebook.com/groups/222582138167532',
    'https://mbasic.facebook.com/groups/1003813763048708',
    'https://mbasic.facebook.com/groups/377668529593660',
    'https://mbasic.facebook.com/groups/1530571577201910',
    'https://mbasic.facebook.com/groups/203402030827523'
]

const sendUrl = env.SEND_URL
const listKeyword = ['giao lưu', 'nháy', 'mẫu mới'];
const timeRefresh = env.TIME_REFRESH

const facebookEmail = env.FACEBOOK_EMAIL;
const facebookPassword = env.FACEBOOK_PASSWORD
module.exports = {timeRefresh, sendUrl, listGroups, listKeyword, facebookEmail, facebookPassword }