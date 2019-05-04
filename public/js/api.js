'use strict';

const api = (function() {
  function postUser(userName, pw) {
    return fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: userName, password: pw })
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  function postAuth(user, pw) {
    return fetch(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: user, password: pw })
    }).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        const err = {
          message: 'Invalid login credentials'
        };
        throw err;
      }
    });
  }

  function getUser(authToken, userName) {
    return fetch(`/api/user/${userName}`, {
      method: 'GET',
      withCredentials: true,
      credentials: 'include',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  function getMaterials(authToken) {
    return fetch('/api/materials', {
      headers: {
        authorization: `Bearer ${authToken}`
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error('Materials not found');
      }
      return response.json();
    });
  }

  function getUserVote(authToken, userId, itemId, materialId) {
    let queryString = $.param({
      userId: userId,
      itemId: itemId,
      materialId: materialId
    });
    return fetch('/api/userVote?' + queryString, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then(response => {
      if (response.ok) {
        return response.json().vote;
      } else {
        return 0;
      }
    });
  }

  function getTotalVote(authToken, itemId, materialId) {
    const voteCountQuery = $.param({ itemId: itemId, materialId: materialId });
    return fetch('/api/voteCount?' + voteCountQuery, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then(response => {
      if (!response.ok) {
        throw response;
      } else {
        return response.json();
      }
    });
  }

  function getItem(authToken, upc) {
    return fetch(`/api/upc/${upc}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response.json();
      }
    });
  }

  function postItem(authToken, userId, itemId) {
    return fetch('/api/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: userId,
        itemId: itemId
      })
    }).then(response => {
      if (!response.ok) {
        const err = {
          message: 'Item not registered'
        };
        throw err;
      } else {
        return response.json();
      }
    });
  }

  function postVote(authToken, userId, itemId, materialId, vote) {
    return fetch('/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: userId,
        itemId: itemId,
        materialId: materialId,
        vote: vote
      })
    }).then(response => {
      if (!response.ok) {
        throw response;
      } else {
        return response.json();
      }
    });
  }

  function postMaterialToItem(authToken, materialId, itemId) {
    return fetch('/api/addMaterialToItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        materialId: materialId,
        itemId: itemId
      })
    }).then(response => {
      if (!response.ok) {
        throw response;
      } else {
        return response.json();
      }
    });
  }

  function getPurchaseHistory(authToken, userId) {
    // hard coded city Id to return San Francisco
    return fetch(`/api/purchase/${userId}?cityId=5ca2d2bce3cdd0915f1e5897 `, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  function deletePurchase(authToken, userId, itemId) {
    return fetch(`/api/purchase`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: userId,
        itemId: itemId
      })
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
    });
  }

  return {
    postUser,
    postAuth,
    getUser,
    getMaterials,
    getUserVote,
    getTotalVote,
    getItem,
    postItem,
    postVote,
    postMaterialToItem,
    getPurchaseHistory,
    deletePurchase
  };
})();
