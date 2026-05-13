const express = require('express')

const router = express.Router()
const { getArticles, getArticleBySlug, getTrendingArticles } = require('../controllers/article.controller')

//public routes
router.get('/',getArticles)
router.get('/trending',getTrendingArticles)
router.get('/:slug',getArticleBySlug)



module.exports = router
