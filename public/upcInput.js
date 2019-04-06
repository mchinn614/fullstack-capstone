'use strict';

//Get and store jwt and userid for requests in session storage
const userName = JSON.parse(sessionStorage.getItem('username'));
const jwt = JSON.parse(sessionStorage.getItem('jwt'));
const userId = fetch(`/api/user/${userName}`, {
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

const mockData = [
  {
    product: {
      ean: '0035200264013',
      title: 'Riceland American Jasmine Rice 2 Lb',
      description: '',
      upc: '035200264013',
      elid: '281779262202',
      brand: 'Riceland',
      model: '',
      color: '',
      size: '',
      dimension: '',
      weight: '',
      lowest_recorded_price: 62.71,
      highest_recorded_price: 62.71,
      images: [],
      offers: []
    },
    materials: [
      { material: 'plastic', recyclable: true },
      { material: 'cardboard', recyclable: true }
    ]
  }
];

const mockMaterials = {
  materials: ['plastic', 'cardboard', 'aluminum', 'rubber', 'steel', 'paper']
};

const mockCounty = {
  countyName: 'San Francisco',
  recyclableMaterials: ['plastic', 'cardboard', 'aluminum', 'paper']
};

const mockUser = {};

var tempList = [];

//UPC Item Db API get
function getProduct(upc) {
  //get data
  for (let i = 0; i < mockData.length; i++) {
    if (upc === mockData[i].product.upc) {
      return mockData[i];
    }
  }
}

//Render list of materials to results section
function renderItems(upc) {
  $('.results').empty();
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
      $('.results').append(
        `<h3 data-id="${item._id}">${item.product.title}</h3><ul class="material-list"></ul>`
      );
      for (let i = 0; i < item.materials.length; i++) {
        let queryString = $.param({
          userId: JSON.parse(sessionStorage.getItem('userId')),
          itemId: item._id,
          materialId: item.materials[i]._id
        });
        fetch('/api/userVote?' + queryString, {
          headers: {
            Authorization: `Bearer ${jwt.authToken}`
          }
        })
          .then(response => {
            console.log(response);
            if (response.ok) {
              return response.json().vote;
            } else {
              return 0;
            }
          })
          .then(vote => {
            //Get total vote count
            const voteCountQuery = $.param({ itemId: item._id, materialId: item.materials[i]._id });
            fetch('/api/voteCount?' + voteCountQuery, {
              headers: {
                Authorization: `Bearer ${jwt.authToken}`
              }
            })
              .then(response => response.json())
              .then(totalVote => {
                $('.material-list').append(
                  `<li data-id="${item.materials[i]._id}">${
                    item.materials[i].materialName
                  }<button data-vote-id="${vote}" class=up-vote>Up Vote (${
                    totalVote.upVote
                  })</button><button data-vote-id="${vote}" class=down-vote>Down Vote (${
                    totalVote.downVote
                  })</button></li>`
                );
              });
          })
          .catch(err => {
            console.log(err);
          });
      }
      $('.results').append(`<button class=add-material>Add New Material</button>`);
      $(addMaterial);

      // POST item to purchase history
      return fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt.authToken}`
        },
        body: JSON.stringify({
          userId: JSON.parse(sessionStorage.getItem('userId')),
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
    })
    .catch(err => {
      console.log(err);
      $('.messages').append(`<p>${err.message}</p>`);
    });
}
//   console.log(result);
//   var listResult = '';
//   for (let j = 0; j < result.materials.length; j++) {
//     listResult =
//       listResult +
//       `<tr class="table-row">
//             <td class="material-name" id=${result.materials[j].material} data-id= >${
//         result.materials[j].material
//       }</td>
//             <td class="recyclable-check">${result.materials[j].recyclable}</td>
//             <td class="delete-button">
//             <button type="button" class="delete">Delete</button>
//             </td>
//         </tr>`;
//   }

//   var htmlTable = `<h4>${result.product.title}</h4><table class="material-table" style="width:100%">
//         <tr class="table-row">
//             <th>Material</th>
//             <th>Recyclable?</th>
//             <th></th>
//         </tr>
//         ${listResult}
//     </table>
//     <button type="button" class="add-new">Add New Material</button>
//     <button type="button" class="save">Save</button>`;
//   $('.results').append(htmlTable);
//   $(addMaterial);
//   $(save);
//   $(deleteMaterial);

//   //add event listener for add-new button
// }

function addNewMaterial(materialName, recycle) {
  mockData.materials.push({ material: materialName, recyclable: recycle });
}

//event listeners
function addMaterial() {
  $('.add-material').on('click', event => {
    $('.material-list').append(
      ` <div id="bloodhound">
            <input class="typeahead" type="text" placeholder="New Material Name">
        </div>`
    );
    // constructs the suggestion engine
    var states = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      // `states` is an array of state names defined in "The Basics"
      local: mockMaterials.materials
    });

    $('#bloodhound .typeahead').typeahead(
      {
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'materials',
        source: states
      }
    );
  });
}

function save() {
  $('.save').on('click', event => {
    $('.messages').empty();
    var newMaterial = [];
    $('.typeahead').map(function() {
      newMaterial.push($(this).val());
    });

    console.log(newMaterial);
    //check if material is valid, and then if it is recyclable
    for (let i = 0; i < newMaterial.length; i++) {
      if (!mockMaterials.materials.includes(newMaterial[i])) {
        $('.messages').append(
          `<p class="warning">${
            newMaterial[i]
          } is not a valid material for this app. Please use a different material.</p>`
        );
      } else {
        //determine if material is recyclable
        var addedMaterial = {};
        if (mockCounty.recyclableMaterials.includes(newMaterial[i])) {
          addedMaterial = {
            material: newMaterial[i],
            recyclable: true
          };
        } else {
          addedMaterial = {
            material: newMaterial[i],
            recyclable: false
          };
        }

        var materialIsNew = true;
        for (let j = 0; j < mockData[0].materials.length; j++) {
          if (_.isEqual(addedMaterial, mockData[0].materials[j])) {
            $('.messages').append(
              `<p class='warning'>${newMaterial[i]} already exists in database</p>`
            );
            materialIsNew = false;
            break;
          }
        }

        if (materialIsNew) {
          mockData[0].materials.push(addedMaterial);
          console.log(mockData);
          $('.messages').append(`<p class='warning'>Added ${newMaterial[i]} to database!</p>`);
        }
      }
    }
    //clear and re-render
    $('.results').empty();
    renderMaterials(mockData[0].product.upc);
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

function viewProfile() {
  $('.profile').on('click', function() {
    $('main').empty();
    $('.profile').removeClass('hidden');
  });
}

function home() {
  $('.home').on('click', function() {
    location.reload();
  });
}

$(watchSubmit);
$(viewProfile);
$(home);
