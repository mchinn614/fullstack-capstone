"use strict";
const express = require("express");
const axios = require("axios");
const router = express.Router();

//UPC DB request to return first item
function getUpc(upc) {
  return axios
    .get(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`)
    .then(res => {
      return res.data.items[0];
    });
}

//send html for user profile page
router.get("/profile/:user", function() {});

//make client request to upc db api
router.get("/new/:upc", function(req, res) {
  console.log(req.params);
  return getUpc(req.params.upc)
    .then(product => {
      res.status(200).json(product);
    })
    .catch(err => console.log(err.message));
});

//get objects by user

//get objects by upc

//post to create new user

//post array of objects to db

//update objects in db

//delete user from db

//delete objects from db

module.exports = router;
