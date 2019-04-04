const mongoose = require('mongoose');

//schema
// const userSchema = mongoose.Schema({
//   name: {
//     firstName: String,
//     lastName: String
//   },
//   email: String,
//   hashPassword: String,
//   items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Items" }]
// });

const itemSchema = mongoose.Schema({
  product: {
    ean: String,
    title: String,
    description: String,
    upc: String,
    elid: String,
    brand: String,
    model: String,
    color: String,
    size: String,
    dimension: String,
    weight: String,
    lowest_recorded_price: Number,
    highest_recorded_price: Number,
    images: [],
    offers: []
  },
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materials' }]
});

const materialSchema = mongoose.Schema({
  materialName: String,
  images: []
});

const citySchema = mongoose.Schema({
  cityName: String,
  recyclableMaterial: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materials' }]
});

// const userProfile = mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
//   productHistory: [{ itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Items' } }],
//   voteHistory: [
//     {
//       item: { type: mongoose.Schema.Types.ObjectId, ref: 'Items' },
//       material: { type: mongoose.Schema.Types.ObjectId, ref: 'Materials' },
//       vote: Number
//     }
//   ]
// });

const voteSchema = mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Items' },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Materials' },
  vote: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const purchaseSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Items' }]
});

// const Users = mongoose.model("User", userSchema);
const Items = mongoose.model('Items', itemSchema);
const Materials = mongoose.model('Materials', materialSchema);
const City = mongoose.model('City', citySchema);
const Vote = mongoose.model('Vote', voteSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = { Items, Materials, City, Vote, Purchase };
