const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema({
    name: String,
    price: Number,
    body: String,
    image: String
  });
  
const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
