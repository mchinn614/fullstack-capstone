const mongoose = require("mongoose");
mongoose.connect();

//schema
const userSchema = mongoose.Schema({
  name: {
    firstName: String,
    lastName: String
  },
  email: String,
  hashPassword: String,
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Items" }]
});

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
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Materials" }]
});

const materialSchema = mongoose.Schema({
  materialName: String,
  images: []
});

const countySchema = mongoose.Schema({
  countyName: String,
  recyclableMaterial: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Materials" }
  ]
});

userSchema.virtual("fullName").get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

const Users = mongoose.model("Users", userSchema);
const Items = mongoose.model("Items", itemSchema);
const Materials = mongoose.model("Materials", materialSchema);
const Counties = mongoose.model("Counties", countySchema);
