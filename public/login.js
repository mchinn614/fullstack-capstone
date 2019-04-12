'use strict';

function watchSubmit() {
  $('.input-form').on('submit', event => {
    event.preventDefault();
    $('.messages').empty();
    const user = $('.username').val();
    const pw = $('.password').val();
    fetch(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: user, password: pw })
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          const err = {
            message: 'Invalid login credentials'
          };
          throw err;
        }
      })
      .then(token => {
        sessionStorage.setItem('username', JSON.stringify(user));
        sessionStorage.setItem('jwt', JSON.stringify(token));
        const userName = JSON.parse(sessionStorage.getItem('username'));
        const jwt = JSON.parse(sessionStorage.getItem('jwt'));
        return fetch(`/api/user/${userName}`, {
          method: 'GET',
          withCredentials: true,
          credentials: 'include',
          headers: {
            authorization: `Bearer ${jwt.authToken}`
          }
        })
          .then(response => {
            console.log(response);
            return response.json();
          })
          .then(user => {
            console.log(user);
            sessionStorage.setItem('userId', JSON.stringify(user._id));
            return user._id;
          });
      })
      .then(() => (window.location.href = '/upcInput.html'))
      .catch(err => {
        $('.messages').append(`<p>${err.message}</p>`);
      });
  });
}

$(watchSubmit);
