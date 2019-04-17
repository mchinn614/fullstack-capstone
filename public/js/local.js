'use strict';
const local = (() => {
  function getUserId() {
    return JSON.parse(sessionStorage.getItem('userId'));
  }

  function getJwt() {
    return JSON.parse(sessionStorage.getItem('jwt')).authToken;
  }

  function getUserName() {
    return JSON.parse(sessionStorage.getItem('username'));
  }

  var dataStore = {};

  return { getUserId, getJwt, getUserName, dataStore };
})();
