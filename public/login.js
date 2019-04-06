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
        window.location.href = '/upcInput.html';
      })
      .catch(err => {
        $('.messages').append(`<p>${err.message}</p>`);
      });
  });
}

$(watchSubmit);
