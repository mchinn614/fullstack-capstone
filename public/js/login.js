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
          sessionStorage.setItem('userId', JSON.stringify(user._id));
          return user._id;
        });
      })
      .then(() => (window.location.href = '../views/upcInput.html'))
      .catch(err => {
        $('.messages').append(`<p class="error-message">${err.message}</p>`);
      });
  });
}
//Profile
function profile() {
  $('.profile').on('click', function() {
    $('.messages').empty();
    try {
      const jwt = local.getJwt();
      window.location.href = '/views/profile.html';
    } catch {
      $('.messages').append(`<p class="error-message">Please login first</p>`);
    }
  });
}

//Upc input view
function input() {
  $('.add-item').on('click', function() {
    $('.messages').empty();

    try {
      const jwt = local.getJwt();
      window.location.href = '/views/upcInput.html';
    } catch {
      $('.messages').append(`<p class="error-message">Please login first</p>`);
    }
  });
}

//Login
function login() {
  $('.login').on('click', () => {
    $('.messages').empty();
    try {
      const jwt = local.getJwt();
      window.location.href = '/views/profile.html';
    } catch {
      $('.messages').append(`<p class="error-message">Please login using valid credentials</p>`);
    }
  });
}

$(profile);
$(input);
$(login);
$(watchSubmit);
