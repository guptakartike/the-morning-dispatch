const express = require('express')
const router = express.Router()
const {createCategory,getCategory,getCategoryBySlug,updateCategory,deleteCategory} = require('../controllers/category.controller')
const authMiddleware = require('../middlewares/auth.middleware')

//public routes
router.get('/',getCategory)
router.get('/:slug',getCategoryBySlug)
//protected routes
router.post('/',authMiddleware,createCategory)
router.put('/:id',authMiddleware,updateCategory)
router.delete('/:id',authMiddleware,deleteCategory)

module.exports = router