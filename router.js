'use strict';
const express = require('express');
const axios = require('axios');
const router = express.Router();
const bodyParser = require('body-parser');
const { Items, Materials, City, Vote, Purchase } = require('./models');
const { User } = require('./users/models');

const unknownError = {
  code: '000',
  message: 'Unknown error',
  status: 500
};
///////////////////////////
//GET Requests
//////////////////////////

//GET Materials
router.get('/materials', (req, res) => {
  Materials.find().then(materials => {
    res.status(200).json(materials);
  });
});

// UPC DB request to return first item

function getUpc(upc) {
  return axios
    .get(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, { timeout: 5000 })
    .then(res => {
      return res.data.items[0];
    })
    .catch(err => {
      return err;
    });
}

//GET: make client request to upc db api and add item to db
router.get('/upc/:upc', function(req, res) {
  return getUpc(req.params.upc)
    .then(item => {
      //check if item exists
      if (!item) {
        const err = {
          code: '002',
          message: 'Item does not exist',
          status: 406
        };
        throw err;
      } else if (!item.upc) {
        const err = {
          code: '002',
          message: 'Item does not exist',
          status: 406
        };
        throw err;
      }
      //add item to db if item is return
      Items.findOneAndUpdate(
        { 'product.upc': item.upc },
        { $set: { product: item } },
        { upsert: true, new: true }
      )
        .populate('materials')
        .then(newItem => {
          if (newItem.materials) {
            return res.status(200).json(newItem);
          }
          return Items.findOneAndUpdate(
            { 'product.upc': item.upc },
            { $set: { product: item, materials: [] } },
            { upsert: true, new: true }
          ).then(newItem2 => res.status(200).json(newItem2));
        })
        .catch(err => {
          res.status(unknownError.status).json(unknownError);
        });
    })
    .catch(err => {
      res.status(err.status).json(err);
    });
});

//GET materials from item
router.get('/item/:itemId', (req, res) => {
  Items.findById(req.params.itemId)
    .populate({ path: 'materials', populate: { path: 'materials' } })
    .then(item => {
      if (item == null) {
        const err = {
          code: '003',
          message: 'item not found',
          status: 406
        };
        throw err;
      }

      res.status(200).json(item);
    })
    .catch(err => {
      res.status(err.status).json(err);
    });
});

//GET vote total for material in item
router.get('/voteCount', bodyParser.json(), (req, res) => {
  const requiredFields = ['materialId', 'itemId'];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.query)) {
      res.status(400).send(`query params must include ${requiredFields[i]}`);
    }
  }
  return Vote.where({ material: req.query.materialId, item: req.query.itemId, vote: 1 })
    .count()
    .then(upVote => {
      return Vote.where({ material: req.query.materialId, item: req.query.itemId, vote: -1 })
        .count()
        .then(downVote => {
          return Items.findOne({ _id: req.query.itemId })
            .populate({ path: 'materials', populate: { path: 'materials' } })
            .then(item => {
              const material = item.materials.filter(x => x._id == req.query.materialId);
              const voteItem = Object.assign(
                { product: item.product, material: material[0] },
                { upVote: upVote, downVote: downVote }
              );
              res.status(200).json(voteItem);
            });
        });
    })
    .catch(() => res.status(unknownError.status).json(unknownError));
});

//GET user current vote for material
router.get('/userVote', bodyParser.json(), (req, res) => {
  const requiredFields = ['materialId', 'itemId', 'userId'];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.query)) {
      res.status(400).send(`req.query must include ${requiredFields[i]}`);
    }
  }
  Vote.find({ material: req.query.materialId, item: req.query.itemId, user: req.query.userId })
    .populate('item')
    .populate('material')
    .populate('user')
    .then(vote => {
      if (!vote.length) {
        const err = {
          code: '005',
          status: 404,
          message: 'vote not found'
        };
        throw err;
      } else {
        res.status(200).json(vote);
      }
    })
    .catch(err => {
      res.status(err.status).json(err);
    });
});

//GET purchase history
router.get('/purchase/:userId', bodyParser.json(), (req, res) => {
  const requiredFields = ['cityId'];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.query)) {
      res.status(400).send(`req.query must include ${requiredFields[i]}`);
    }
  }
  return Purchase.findOne({ user: req.params.userId })
    .populate('user')
    .populate({ path: 'items', populate: { path: 'items' } })
    .populate({ path: 'items', populate: { path: 'materials', model: 'Materials' } })
    .then(purchase => {
      if (!purchase) {
        const err = {
          code: '007',
          status: 406,
          message: 'user not found'
        };
        throw err;
      }

      return City.findOne({ _id: req.query.cityId })
        .then(city => {
          let result = [];
          for (let j = 0; j < purchase.items.length; j++) {
            result.push({ item: purchase.items[j], recyclability: [] });
            for (let k = 0; k < purchase.items[j].materials.length; k++) {
              if (purchase.items[j].materials[k] == null) {
                const err = {
                  status: 404,
                  message: 'Material not found'
                };
                throw err;
              } else if (
                city.recyclableMaterial
                  .toString()
                  .includes(purchase.items[j].materials[k]._id.toString())
              ) {
                result[j].recyclability.push({
                  material: purchase.items[j].materials[k],
                  recyclable: true
                });
              } else {
                result[j].recyclability.push({
                  material: purchase.items[j].materials[k],
                  recyclable: false
                });
              }
            }
          }
          return result;
        })
        .then(result => {
          res.status(200).json({ result: result });
        });
    })
    .catch(err => {
      res.status(err.status).json(err);
    });
});

router.get('/user/:userName', (req, res) => {
  User.findOne({ username: req.params.userName }).then(user => {
    res.status(200).json(user);
  });
});

/////////////////////////
//POST
/////////////////////////

//POST: Add item to puchase history
router.post('/purchase', bodyParser.json(), (req, res) => {
  //ensure request body has required fields
  const requiredFields = [('userId', 'itemId')];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.body)) {
      res.status(400).send(`Req body must include ${requiredFields[i]}`);
    }
  }
  return Purchase.findOneAndUpdate(
    { user: req.body.userId },
    { $push: { items: req.body.itemId } },
    { new: true, upsert: true }
  )
    .then(addedPurchase => {
      if (!addedPurchase.user) {
        const err = {
          code: '004',
          message: 'Error adding purchase',
          status: 406
        };
        throw err;
      } else {
        return res.status(200).json(addedPurchase);
      }
    })
    .catch(err => res.status(406).send(err.message));
});

//POST: add new material to item
router.post('/addMaterialToItem', bodyParser.json(), (req, res) => {
  //required field
  const requiredFields = ['materialId', 'itemId'];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.body)) {
      res.status(400).send(`Req body must include ${requiredFields[i]}`);
    }
  }

  Items.findOne({ $and: [{ _id: req.body.itemId, materials: { $in: req.body.materialId } }] })
    .then(mat => {
      if (!(mat == null)) {
        const err = {
          code: '001',
          message: 'Material already in db',
          status: 406
        };
        throw err;
      } else {
        return Items.findOneAndUpdate(
          { _id: req.body.itemId },
          { $push: { materials: req.body.materialId } },
          { upsert: false, new: true }
        )
          .populate({ path: 'materials', populate: { path: 'materials' } })
          .then(updatedItem => {
            return res.status(200).json(updatedItem);
          });
      }
    })
    .catch(err => {
      res.status(err.status).json(err);
    });
});

//POST: Add up/down vote
router.post('/vote', bodyParser.json(), (req, res) => {
  const requiredFields = ['userId', 'vote', 'itemId', 'materialId'];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.body)) {
      res.status(400).send(`Req body must include ${requiredFields[i]}`);
    }
  }
  //ensure vote is 1, -1
  if (!(req.body.vote === 1 || req.body.vote === -1)) {
    const err = {
      status: 400,
      message: 'Vote must be 1 or -1'
    };
    res.status(err.status).json(err);
  }

  //update vote collection
  return Vote.findOneAndUpdate(
    { material: req.body.materialId, item: req.body.itemId, user: req.body.userId },
    {
      item: req.body.itemId,
      material: req.body.materialId,
      vote: req.body.vote,
      user: req.body.userId
    },
    { upsert: true, new: true }
  )
    .then(updatedPurchase => {
      res.status(200).json(updatedPurchase);
    })
    .catch(() => res.status(unknownError.status).json(unknownError));
});

////////////////////////////
//DELETE REQUESTS
////////////////////////////

//DELETE item from purchase history
router.delete('/purchase', bodyParser.json(), (req, res) => {
  const requiredFields = ['itemId', 'userId'];
  for (let i = 0; i < requiredFields.length; i++) {
    if (!(requiredFields[i] in req.body)) {
      res.status(400).send(`Req body must include ${requiredFields[i]}`);
    }
  }
  return Purchase.findOne({
    $and: [{ user: req.body.userId }, { items: { $in: req.body.itemId } }]
  })
    .then(purchase => {
      if (!purchase) {
        const err = {
          code: '008',
          status: 406,
          message: 'Purchase does not exist in user profile'
        };
        throw err;
      }
      for (let i = 0; i < purchase.items.length; i++) {
        if (purchase.items[i] == req.body.itemId) {
          purchase.items.splice(i, 1);
          break;
        }
      }
      return Purchase.findOneAndUpdate(
        { user: req.body.userId },
        { items: purchase.items },
        { new: true }
      ).then(updatedPurchase => {
        res.status(204).end();
      });
    })
    .catch(err => res.status(err.status).json(err));
});

// //add new material - for dev  only
// router.post('/materials', bodyParser.json(), (req, res) => {
//   return Materials.create({ materialName: req.body.material })
//     .then(() => {
//       res.status(200).send(`added ${req.body.material}`);
//     })
//     .catch(err => {
//       res.status(unknownError.status).json(unknownError);
//     });
// });

// //add new city - for dev only
// router.post('/city/:city', bodyParser.json(), (req, res) => {
//   const recycleMaterials = req.body.recycle;
//   console.log(recycleMaterials);
//   var materialIds = [];
//   for (let i = 0; i < recycleMaterials.length; i++) {
//     Materials.findOne({ materialName: recycleMaterials[i] })
//       .then(mat => {
//         if (mat) {
//           materialIds.push(mat._id);
//           return materialIds;
//         } else {
//           Materials.create({ materialName: recycleMaterials[i] }).then((err, item) => {
//             materialIds.push(item._id);
//             return MaterialIds;
//           });
//         }
//       })
//       .then(ids => {
//         console.log('ids', ids);
//         City.findOneAndUpdate(
//           { cityName: req.params.city },
//           { recyclableMaterial: ids },
//           { upsert: true }
//         ).then(() => {
//           if (i === recycleMaterials.length - 1) {
//             res.status(201).send('successfully updated');
//           }
//         });
//       });
//   }
// });

module.exports = router;
