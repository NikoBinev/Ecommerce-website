const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/create', productController.blog_create_get);
router.get('/', productController.blog_index);
router.post('/', productController.blog_create_post);
router.get('/:id', productController.blog_details);
router.delete('/:id', productController.blog_delete);

module.exports = router;