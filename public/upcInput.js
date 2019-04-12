'use strict';

//Get and store jwt and userid for requests in session storage
const userName = JSON.parse(sessionStorage.getItem('username'));
const jwt = JSON.parse(sessionStorage.getItem('jwt'));
const userId = JSON.parse(sessionStorage.getItem('userId'));
var dataStore = {};
const materials = fetch('/api/materials', {
  headers: {
    authorization: `Bearer ${jwt.authToken}`
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Materials not found');
    }
    return response.json();
  })
  .then(materials => {
    Object.assign(dataStore, { materials: materials });
    console.log(dataStore);
  });

//Function to render imtem
function displayItem(item) {
  $('.results').empty();

  //Store item
  dataStore.item = item;
  $('.results').append(
    `<h3 data-id="${item._id}">${item.product.title}</h3><ul class="material-list"></ul>`
  );

  //Create array of promises
  var promises = [];
  for (let i = 0; i < item.materials.length; i++) {
    let queryString = $.param({
      userId: userId,
      itemId: item._id,
      materialId: item.materials[i]._id
    });
    promises.push(
      fetch('/api/userVote?' + queryString, {
        headers: {
          Authorization: `Bearer ${jwt.authToken}`
        }
      })
        .then(response => {
          if (response.ok) {
            return response.json().vote;
          } else {
            return 0;
          }
        })
        .then(vote => {
          console.log(vote);
          //Get total vote count
          const voteCountQuery = $.param({ itemId: item._id, materialId: item.materials[i]._id });
          return fetch('/api/voteCount?' + voteCountQuery, {
            headers: {
              Authorization: `Bearer ${jwt.authToken}`
            }
          })
            .then(response => response.json())
            .then(totalVote => {
              console.log(totalVote);
              $('.material-list').append(
                `<li data-id="${item.materials[i]._id}">${
                  item.materials[i].materialName
                }<button data-vote-id="${vote}" class="vote up-vote">Up Vote (${
                  totalVote.upVote
                })</button><button data-vote-id="${vote}" class="vote down-vote">Down Vote (${
                  totalVote.downVote
                })</button></li>`
              );
              return totalVote;
            });
        })
        .catch(err => {
          console.log(err);
        })
    );
  }
  Promise.all(promises).then(() => {
    $('.results').append(`<button class=add-material>Add New Material</button>`);
    $(addMaterial);
    $(vote);
  });
}

//Render list of materials to results section
function renderItems(upc) {
  fetch(`/api/upc/${upc}`, {
    headers: {
      Authorization: `Bearer ${jwt.authToken}`
    }
  })
    .then(response => {
      console.log(response);
      if (response.ok) {
        return response.json();
      } else {
        throw response.json();
      }
    })
    .then(item => {
      // POST item to purchase history
      fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt.authToken}`
        },
        body: JSON.stringify({
          userId: userId,
          itemId: item._id
        })
      }).then(response => {
        if (!response.ok) {
          const err = {
            message: 'Item not registered'
          };
          throw err;
        }
      });
      return displayItem(item);
    })
    .catch(err => {
      console.log(err);
      $('.messages').append(`<p>${err.message}</p>`);
    });
}

//event listeners
//ERRROR with voting delayed. and then renders copy of materials??
function vote() {
  $('.messages').empty();
  $('.vote').each(function() {
    $(this).on('click', event => {
      console.log($(this).attr('class'));
      if ($(this).hasClass('up-vote')) {
        var vote = 1;
      } else {
        var vote = -1;
      }

      fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt.authToken}`
        },
        body: JSON.stringify({
          userId: userId,
          itemId: dataStore.item._id,
          materialId: $(this)
            .parent('li')
            .attr('data-id'),
          vote: vote
        })
      })
        .then(response => {
          if (!response.ok) {
            throw response;
          } else {
            return response.json();
          }
        })
        .then(updatedVote => {
          return displayItem(dataStore.item);
        })
        .catch(err => {
          err.json().then(errObj => $('.messages').append(`<p>${errObj.message}</p>`));
        });
    });
  });
}

function addMaterial() {
  $('.add-material').on('click', event => {
    $('.material-list').append(
      ` <div id="bloodhound">
            <input class="typeahead" type="text" placeholder="New Material Name">
        </div>`
    );
    // constructs the suggestion engine
    var materials = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      // `states` is an array of state names defined in "The Basics"
      local: dataStore.materials.map(x => x.materialName)
    });

    $('#bloodhound .typeahead').typeahead(
      {
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'materials',
        source: materials
      }
    );
    $('.results').append('<button class="save">Save</button>');
    $(save);
  });
}

function save() {
  $('.save').on('click', event => {
    $('.messages').empty();

    var newMaterial = $('.tt-input').val();
    var materialId = dataStore.materials.filter(x => x.materialName === newMaterial)[0]._id;

    fetch('/api/addMaterialToItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt.authToken}`
      },
      body: JSON.stringify({
        materialId: materialId,
        itemId: dataStore.item._id
      })
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        } else {
          return response.json();
        }
      })
      .then(updatedItem => {
        //vote
        fetch('/api/vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt.authToken}`
          },
          body: JSON.stringify({
            materialId: materialId,
            itemId: dataStore.item._id,
            vote: 1,
            userId: userId
          })
        }).then(() => {
          displayItem(updatedItem);
          $('.messages').append('<p>Material successfully added to item</p>');
        });
      })
      .catch(err => {
        err.json().then(errObj => {
          $('.messages').append(`<p>${errObj.message}</p>`);
        });
      });
  });
}

function deleteMaterial() {
  $('.delete').on('click', function() {
    $('.messages').empty();
    const material = $(this)
      .parent()
      .siblings('.material-name')
      .attr('id');
    for (let i = 0; i < mockData[0].materials.length; i++) {
      if (material === mockData[0].materials[i].material) {
        mockData[0].materials.splice(i, 1);
      }
    }
    $(this)
      .closest('.table-row')
      .remove();
  });
}
function watchSubmit() {
  $('.input-form').on('submit', event => {
    event.preventDefault();
    $('.results').empty();
    $('.messages').empty();
    const upc = $('.upc-input').val();
    renderItems(upc);
  });
}

//Profile
function profile() {
  $('.profile').on('click', function() {
    window.location.href = '/profile.html';
  });
}

//Upc input view
function input() {
  $('.add-item').on('click', function() {
    window.location.href = '/upcInput.html';
  });
}

//Logout
function logout() {
  $('.logout').on('click', () => {
    sessionStorage.clear();
    dataStore = {};
    window.location.href = '/index.html';
  });
}

$(watchSubmit);
$(profile);
$(input);
$(logout);
