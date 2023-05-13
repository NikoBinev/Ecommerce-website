const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title:  {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String,
        filePath: String,
        name:String
    },
    body: {
        type: String,
        required: true
    }
}, { timestamps: true});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;