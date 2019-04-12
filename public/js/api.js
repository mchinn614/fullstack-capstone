'use strict';

//API Requests here
const api = () => {
  function postUser(userName, pw) {
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: userName, password: pw })
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  function postAuth(user, pw) {
    fetch(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: user, password: pw })
    }).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        const err = {
          message: 'Invalid login credentials'
        };
        throw err;
      }
    });
  }

  function getUser(userName) {
    fetch(`/api/user/${userName}`, {
      method: 'GET',
      withCredentials: true,
      credentials: 'include',
      headers: {
        authorization: `Bearer ${jwt.authToken}`
      }
    }).then(response => {
      console.log(response);
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  function getMaterials() {
    fetch('/api/materials', {
      headers: {
        authorization: `Bearer ${jwt.authToken}`
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Materials not found');
      }
      return response.json();
    });
  }

  return { postUser, postAuth, getUser, getMaterials };
};
