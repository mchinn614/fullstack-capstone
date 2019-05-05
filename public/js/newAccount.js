'use strict';

function watchSubmit() {
  $('.input-form').on('submit', event => {
    event.preventDefault();
    $('.messages').empty();
    const userName = $('.new-username').val();
    const pw1 = $('.new-password1').val();
    const pw2 = $('.new-password2').val();
    //check if passwords match
    if (!(pw1 === pw2)) {
      $('.messages').append(`<p class="error-message">Passwords do no match, please try again</p>`);
    } else {
      api
        .postUser(userName, pw1)
        .then(responseJson => {
          if (responseJson.message) {
            $('.messages').append(`<p class="error-message">${responseJson.message}</p>`);
          } else {
            $('.messages').append(
              '<p class="error-message">Account created successfully. Please login <a href="/index.html">here</a>.</p>'
            );
          }
        })
        .catch(err => {
          err.json().then(errObj => {
            $('.messages').append(`<p class="error-message">${errObj.message}</p>`);
          });
        });
    }
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
    try {
      const jwt = local.getJwt();
      window.location.href = '/views/profile.html';
    } catch {
      window.location.href = '/index.html';
    }
  });
}

$(profile);
$(input);
$(login);
$(watchSubmit);
