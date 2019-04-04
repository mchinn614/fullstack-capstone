'use strict';

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
function renderMaterials(upc) {
  const result = getProduct(upc);
  console.log(result);
  var listResult = '';
  for (let j = 0; j < result.materials.length; j++) {
    listResult =
      listResult +
      `<tr class="table-row">
            <td class="material-name" id=${result.materials[j].material} data-id= >${
        result.materials[j].material
      }</td>
            <td class="recyclable-check">${result.materials[j].recyclable}</td>
            <td class="delete-button">
            <button type="button" class="delete">Delete</button>
            </td>
        </tr>`;
  }

  var htmlTable = `<h4>${result.product.title}</h4><table class="material-table" style="width:100%">
        <tr class="table-row">
            <th>Material</th>
            <th>Recyclable?</th>
            <th></th>
        </tr>
        ${listResult}
    </table>
    <button type="button" class="add-new">Add New Material</button>
    <button type="button" class="save">Save</button>`;
  $('.results').append(htmlTable);
  $(addMaterial);
  $(save);
  $(deleteMaterial);

  //add event listener for add-new button
}

function addNewMaterial(materialName, recycle) {
  mockData.materials.push({ material: materialName, recyclable: recycle });
}

//event listeners
function addMaterial() {
  $('.add-new').on('click', event => {
    $('.material-table').append(
      `<tr class="table-row">
            <td class="material-name">
                <div id="bloodhound">
                    <input class="typeahead" type="text" placeholder="New Material Name">
                </div>
            </td>
        </tr>`
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
    renderMaterials(upc);
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
