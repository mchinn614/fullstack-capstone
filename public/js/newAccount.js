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
      $('.messages').append(`<p>Passwords do no match, please try again</p>`);
    } else {
      api
        .postUser(userName, pw1)
        .then(responseJson => {
          console.log(responseJson);
          $('.messages').append(
            '<p>Account created successfully. Please login <a href="/index.html">here</a>.</p>'
          );
        })
        .catch(err => {
          console.log(err);
          err.json().then(errObj => {
            $('.messages').append(`<p>${errObj.message}</p>`);
          });
          // NEED TO FIX THIS. WHY ARE MESSAGES NOT IN RESPONSE
          // $('.messages').append('<p>Error creating account. Please try again.</p>');
        });
    }
  });
}

$(watchSubmit);
