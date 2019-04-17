'use strict';

function watchSubmit() {
  $('.input-form').on('submit', event => {
    event.preventDefault();
    $('.messages').empty();
    const user = $('.username').val();
    const pw = $('.password').val();
    api
      .postAuth(user, pw)
      .then(token => {
        sessionStorage.setItem('username', JSON.stringify(user));
        sessionStorage.setItem('jwt', JSON.stringify(token));
        const userName = JSON.parse(sessionStorage.getItem('username'));
        const jwt = JSON.parse(sessionStorage.getItem('jwt'));
        return api.getUser(jwt.authToken, userName).then(user => {
          console.log(user);
          sessionStorage.setItem('userId', JSON.stringify(user._id));
          return user._id;
        });
      })
      .then(() => (window.location.href = '../views/upcInput.html'))
      .catch(err => {
        $('.messages').append(`<p>${err.message}</p>`);
      });
  });
}

$(watchSubmit);
