function clearCookies () {
    const { session } = require('electron');
    session.defaultSession.clearStorageData({
      storages: ['cookies'],
      quotas: []
    }, function() {
      console.log('Cookies cleared!');
    });
  }

  module.exports = {clearCookies}