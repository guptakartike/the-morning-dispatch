const articleModel = require('../models/article.model')

async function getArticles(req,res,next) {
    try{

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const { category, search } = req.query

        let filter = {}

        // category filter
        if(category){
            filter.category = category
        }

        // search filter
        if(search){
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { summary: { $regex: search, $options: "i" } }
            ]
        }


        const articles = await articleModel
            .find(filter)
            
            
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await articleModel.countDocuments(filter)

        res.json({
            success:true,
            page,
            total,
            count: articles.length,
            articles
        })

    }catch(err){
        next(err)
    }
}
async function getArticleBySlug(req,res,next) {
    try{
        const { slug } = req.params

        const article = await articleModel.findOne({ slug })

        if(!article){
            return res.status(404).json({
                success:false,
                message:"Article not found"
            })
        }

        res.json({
            success:true,
            article
        })

    }catch(err){
        next(err)
    }
}
async function getTrendingArticles(req,res,next) {
    try{

        const articles = await articleModel
            .find({})            
            .sort({ createdAt: -1 })
            .limit(5)
            
            

        res.json({
            success:true,
            count: articles.length,
            articles
        })

    }catch(err){
        next(err)
    }
}

module.exports = {getArticles ,getArticleBySlug ,getTrendingArticles}