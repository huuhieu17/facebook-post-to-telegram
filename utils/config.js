const env = process.env;
const listGroups = [
    'https://www.facebook.com/groups/222582138167532?sorting_setting=CHRONOLOGICAL',
    'https://www.facebook.com/groups/1003813763048708?sorting_setting=CHRONOLOGICAL',
    'https://www.facebook.com/groups/377668529593660?sorting_setting=CHRONOLOGICAL',
    'https://www.facebook.com/groups/1530571577201910?sorting_setting=CHRONOLOGICAL',
    'https://www.facebook.com/groups/203402030827523?sorting_setting=CHRONOLOGICAL',
    'https://www.facebook.com/groups/2578876712354829?sorting_setting=CHRONOLOGICAL',
]

const sendUrl = env.SEND_URL
const listKeyword = ['giao lưu', 'nháy', 'mẫu mới'];
const timeRefresh = env.TIME_REFRESH

const facebookEmail = env.FACEBOOK_EMAIL;
const facebookPassword = env.FACEBOOK_PASSWORD
module.exports = {timeRefresh, sendUrl, listGroups, listKeyword, facebookEmail, facebookPassword }