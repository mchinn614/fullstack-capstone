'use strict';

//Load Profile Information
const jwt = local.getJwt();
const userId = local.getUserId();
const userName = local.getUserName();

//set userId
$('.logout').empty();
$('.logout').append(`Logout (${userName})`);

function renderProfile() {
  api
    .getPurchaseHistory(jwt, userId)
    .then(purchaseHistory => {
      const purchases = purchaseHistory.result;

      $('.page-results').pagination({
        dataSource: purchases,
        pageSize: 5,
        callback: function(data, pagination) {
          var html = template(data);
          $('.results').html(html);
          $(deleteItem);
        }
      });
      return purchases;
    })
    .then(purchases => {
      //count percentage of materials that are recyclable
      var total = 0;
      var countRecycle = 0;
      purchases.forEach(purchase => {
        purchase.recyclability.forEach(mat => {
          total = total + 1;
          countRecycle = countRecycle + (mat.recyclable ? 1 : 0);
        });
      });

      makeChart(countRecycle, total);
    })
    .catch(err => {
      err.json().then(errObj => {});
    });
}

function template(purchases) {
  return purchases.map(purchase => {
    return `<div class="profile-list">
    <h3 class="product-name" data-item-id="${purchase.item._id}">${purchase.item.product.title}</h3>
  <p class="materials">Materials: 
    ${purchase.recyclability
      .map(mat => {
        return `${mat.material.materialName}`;
      })
      .join(', ')}
    </p>
    <button type="button" class="delete-item">Delete Item</button>
    </div>`;
  });
}

//Event Listeners

//Make pie chart for recyclability
function makeChart(recycleCount, total) {
  $('#chartContainer').empty();
  var options = {
    backgroundColor: 'white',
    legend: {
      fontColor: 'black',
      fontFamily: 'roboto',
      fontSize: 16
    },
    data: [
      {
        type: 'pie',
        startAngle: -45,
        showInLegend: 'true',
        legendText: '{indexLabel}',
        percentFormatString: '##.00',
        toolTipContent: '#percent%',
        dataPoints: [
          { indexLabel: 'Recyclable', y: (recycleCount / total) * 100 },
          { indexLabel: 'Non-recyclable', y: ((total - recycleCount) / total) * 100 }
        ]
      }
    ]
  };
  $('#chartContainer').CanvasJSChart(options);
}

//Delete item
function deleteItem() {
  $('.delete-item').on('click', event => {
    const itemId = $(event.currentTarget)
      .parent()
      .find('h3')
      .attr('data-item-id');
    return api
      .deletePurchase(jwt, userId, itemId)
      .then(() => renderProfile())
      .catch(err => {
        err.json().then(errObj => {});
      });
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
    window.location.href = '/index.html';
  });
}

$(renderProfile);
$(profile);
$(input);
$(logout);
