'use strict';

//Get and store jwt and userid for requests in session storage
const userName = local.getUserName();
const jwt = local.getJwt();
const userId = local.getUserId();

const materials = api
  .getMaterials(jwt)
  .then(materials => {
    Object.assign(local.dataStore, { materials: materials });
    console.log(local.dataStore);
  })
  .catch(err => {
    console.log(err);
    $('.messages').append(err);
  });

//Function to render imtem
function displayItem(item) {
  $('.results').empty();

  //Store item
  local.dataStore.item = item;
  $('.results').append(
    `<h3 data-id="${item._id}">${item.product.title}</h3><ul class="material-list"></ul>`
  );

  var promises = [];

  item.materials.forEach(material => {
    $('.material-list').append(
      `<li data-id="${material._id}">
      ${material.materialName}
      <span class="${material._id}"></span>
    </li>`
    );
    return promises.push(renderVoteButton(`.${material._id}`, item._id, material._id));
  });
  Promise.all(promises).then(() => {
    console.log('test');
    $('.results').append(`<button class=add-material>Add New Material</button>`);
    $(addMaterial);
    $(vote);
  });
}

//render material in list for each item. A container for the material should be defined prior to excuting function
//WHY DOES THIS REPEAT
function renderVoteButton(domTarget, itemId, materialId) {
  return api.getTotalVote(jwt, itemId, materialId).then(totalVote => {
    return api.getUserVote(jwt, userId, itemId, materialId).then(userVote => {
      $(domTarget).empty();
      $(domTarget).append(
        `<button  class="vote up-vote vote-${userVote}">
            Up Vote (${totalVote.upVote})
        </button>
        <button class="vote down-vote vote-${userVote}">
            Down Vote (${totalVote.downVote})
        </button>`
      );
      $(vote);
      return totalVote;
    });
  });
}

//Render list of materials to results section
function renderItems(upc) {
  api
    .getItem(jwt, upc)
    .then(item => {
      // POST item to purchase history
      api.postItem(jwt, userId, item._id).then(response => {
        if (!response.ok) {
          const err = {
            message: 'Item not registered'
          };
          throw err;
        }
      });
      //FIX THIS
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
  $('.vote').on('click', function() {
    console.log($(this).attr('class'));
    if ($(this).hasClass('up-vote')) {
      var vote = 1;
    } else {
      var vote = -1;
    }
    const materialId = $(this)
      .closest('li')
      .attr('data-id');

    console.log(materialId);
    return api
      .postVote(jwt, userId, local.dataStore.item._id, materialId, vote)
      .then(updatedVote => {
        console.log(updatedVote);
        return renderVoteButton(`.${materialId}`, local.dataStore.item._id, materialId);
      })
      .catch(err => {
        err.json().then(errObj => $('.messages').append(`<p>${errObj.message}</p>`));
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
      local: local.dataStore.materials.map(x => x.materialName)
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
    var materialId = local.dataStore.materials.filter(x => x.materialName === newMaterial)[0]._id;

    api
      .postMaterialToItem(jwt, materialId, local.dataStore.item._id)
      .then(updatedItem => {
        console.log(updatedItem);
        //vote
        api.postVote(jwt, userId, local.dataStore.item._id, materialId, 1).then(() => {
          //FIX THIS
          return displayItem(updatedItem);
          // $('.messages').append('<p>Material successfully added to item</p>');
        });
      })
      .catch(err => {
        err.json().then(errObj => {
          $('.messages').append(`<p>${errObj.message}</p>`);
        });
      });
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
    window.location.href = '/views/profile.html';
  });
}

//Upc input view
function input() {
  $('.add-item').on('click', function() {
    window.location.href = '/views/upcInput.html';
  });
}

//Logout
function logout() {
  $('.logout').on('click', () => {
    sessionStorage.clear();
    local.dataStore = {};
    window.location.href = '/index.html';
  });
}

$(watchSubmit);
$(profile);
$(input);
$(logout);
