const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const uploadMiddleware = require('../middlewares/upload.middleware')
const router = express.Router()
const{createArticle ,getArticles ,getArticleBySlug ,getTrendingArticles ,updateArticle ,deleteArticle ,togglePublish ,toggleFeatured ,toggleBreaking} = require('../controllers/article.controller')

//public routes
router.get('/',getArticles)
router.get('/trending',getTrendingArticles)
router.get('/:slug',getArticleBySlug)


//protected routes
router.post('/',authMiddleware, uploadMiddleware.single("image"), createArticle)
router.put('/:id',authMiddleware,uploadMiddleware.single("image"),updateArticle)
router.delete('/:id',authMiddleware,deleteArticle)

router.patch('/:id/publish',authMiddleware,togglePublish)
router.patch('/:id/featured',authMiddleware,toggleFeatured)
router.patch('/:id/breaking',authMiddleware,toggleBreaking)


module.exports = router
