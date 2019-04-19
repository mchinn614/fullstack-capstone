'use strict';

const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { Items, Materials, City, Vote, Purchase } = require('../models');
const { User } = require('../users/models');

const { app, runServer, closeServer } = require('../server');
chai.use(chaiHttp);
const expect = chai.expect;

var jwt = '';

function seedData() {
  //create new user
  const userName = 'fakeUser';
  const pw = 'password1234';
  var user = {};
  return chai
    .request(app)
    .post('/api/users')
    .set('Content-Type', 'application/json')
    .send({ username: userName, password: pw })
    .then(res => {
      user = res.body;
      return chai
        .request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ username: userName, password: pw })
        .then(res => {
          jwt = res.body.authToken;
        });
    })
    .then(res => {
      //seed materials, item, vote
      return Materials.insertMany([
        { images: [], materialName: 'paper' },
        { images: [], materialName: 'plastic' }
      ]).then(mat => {
        return Items.create({ product: { title: 'testItem' }, materials: [mat[0]._id] }).then(
          item => {
            return Vote.create({
              item: item._id,
              material: mat[0]._id,
              user: user._id,
              vote: 1
            }).then(vote => {
              return City.create({ cityName: 'Test City', recyclableMaterial: [mat[0]._id] });
            });
          }
        );
      });
    });
}

function tearDown() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('client test', function() {
  before(function() {
    return runServer(process.env.TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return seedData();
  });

  afterEach(function() {
    return tearDown();
  });

  it('GET materials', function() {
    return chai
      .request(app)
      .get('/api/materials')
      .set('authorization', `Bearer ${jwt}`)
      .then(res => {
        expect(res).to.have.status(200);
        return Materials.find().then(materials => {
          expect(JSON.stringify(res.body)).to.equal(JSON.stringify(materials));
        });
      });
  });

  it('GET UPC', function() {
    const upc = '035200264013';
    return chai
      .request(app)
      .get(`/api/upc/${upc}`)
      .set('authorization', `Bearer ${jwt}`)
      .then(res => {
        expect(res).to.have.status(200);
        return Items.findOne({ 'product.upc': upc }).then(item => {
          expect(JSON.stringify(res.body)).to.equal(JSON.stringify(item));
        });
      });
  });

  it('POST purchase', function() {
    return User.findOne()
      .then(res => {
        return res;
      })
      .then(user => {
        return Items.findOne().then(res => {
          return { user: user, item: res };
        });
      })
      .then(res => {
        return chai
          .request(app)
          .post('/api/purchase')
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${jwt}`)
          .send({
            userId: res.user._id,
            itemId: res.item._id
          })
          .then(apiRes => {
            expect(apiRes).to.have.status(200);
            return Purchase.findOne({ user: res.user._id }).then(purchase => {
              expect(JSON.stringify(apiRes.body)).to.equal(JSON.stringify(purchase));
            });
          });
      });
  });

  it('POST addMaterialToItem', function() {
    return Materials.findOne({ materialName: 'plastic' })
      .then(material => {
        return Items.findOne().then(item => {
          return { material: material, item: item };
        });
      })
      .then(res => {
        return chai
          .request(app)
          .post('/api/addMaterialToItem')
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${jwt}`)
          .send({
            materialId: res.material._id,
            itemId: res.item._id
          })
          .then(apiRes => {
            expect(apiRes).to.have.status(200);
            return Items.findOne({ materials: { $in: [res.material._id] } })
              .populate({ path: 'materials', populate: { path: 'materials' } })
              .then(updatedItem => {
                expect(JSON.stringify(apiRes.body)).to.equal(JSON.stringify(updatedItem));
              });
          });
      });
  });

  it('POST vote', function() {
    return Promise.all([
      User.findOne().then(user => {
        return { user: user };
      }),
      Items.findOne().then(item => {
        return { item: item };
      })
    ]).then(res => {
      var data = {};
      res.forEach(obj => Object.assign(data, obj));
      return chai
        .request(app)
        .post('/api/vote')
        .set('Content-Type', 'application/json')
        .set('authorization', `Bearer ${jwt}`)
        .send({
          materialId: data.item.materials[0],
          itemId: data.item._id,
          userId: data.user._id,
          vote: -1
        })
        .then(apiRes => {
          expect(apiRes).to.have.status(200);
          return Vote.findOne({
            material: data.item.materials[0],
            item: data.item._id,
            user: data.user._id,
            vote: -1
          }).then(vote => {
            expect(vote.vote).to.equal(-1);
          });
        });
    });
  });

  it('GET item', function() {
    return Items.findOne().then(item => {
      return chai
        .request(app)
        .get(`/api/item/${item._id}`)
        .set('authorization', `Bearer ${jwt}`)
        .then(apiRes => {
          expect(apiRes).to.have.status(200);
          return Items.findById(item._id)
            .populate({ path: 'materials', populate: { path: 'materials' } })
            .then(res => {
              expect(JSON.stringify(apiRes.body)).to.equal(JSON.stringify(res));
            });
        });
    });
  });

  it('GET vote count', function() {
    return Items.findOne().then(item => {
      return chai
        .request(app)
        .get(`/api/voteCount?materialId=${item.materials[0]}&itemId=${item._id}`)
        .set('authorization', `Bearer ${jwt}`)
        .then(apiRes => {
          expect(apiRes).to.have.status(200);
          expect(apiRes.body.upVote).to.equal(1);
        });
    });
  });

  it('GET user vote', function() {
    return Promise.all([
      Items.findOne().then(item => {
        return { item: item };
      }),
      User.findOne().then(user => {
        return { user: user };
      })
    ]).then(res => {
      var data = {};
      res.forEach(obj => Object.assign(data, obj));
      return chai
        .request(app)
        .get(
          `/api/userVote?materialId=${data.item.materials[0]}&itemId=${data.item._id}&userId=${
            data.user._id
          }`
        )
        .set('authorization', `Bearer ${jwt}`)
        .then(apiRes => {
          expect(apiRes).to.have.status(200);
          expect(apiRes.body[0].vote).to.equal(1);
        });
    });
  });

  it('GET purchase history', function() {
    return User.findOne().then(user => {
      return City.findOne().then(city => {
        return Items.findOne()
          .populate('materials')
          .then(item => {
            return Purchase.create({ user: user._id, items: [item._id] }).then(purchase => {
              return chai
                .request(app)
                .get(`/api/purchase/${user._id}?cityId=${city._id}`)
                .set('authorization', `Bearer ${jwt}`)
                .then(apiRes => {
                  expect(apiRes).to.have.status(200);
                  expect(JSON.stringify(apiRes.body.result[0].item)).to.deep.equal(
                    JSON.stringify(item)
                  );
                });
            });
          });
      });
    });
  });
});
