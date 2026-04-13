const articleModel = require('../models/article.model')
const slugify = require('slugify')

async function createArticle(req,res,next) {
      
    try{
        const {title, summary, content, category, isFeatured, isBreaking} = req.body

        if(!title || !content){
            return res.status(400).json({
                message:"Title and content are required"
            })
        }

        const slug = slugify(title,{lower:true})

        let image = null
        if(req.file){
            image = `/uploads/${req.file.filename}`
        }

        const article = await articleModel.create({
            title,
            slug,
            summary,
            content,
            image,
            category,
            author:req.user.id,
            isFeatured,
            isBreaking
        })

        res.status(201).json({
                success:true,
                message:"Article created successfully",
                article
            })
    }
    catch(err){
        next(err)
    }

}
async function getArticles(req,res,next) {
    try{

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const { category, search, featured, breaking } = req.query

        let filter = {
            isPublished: true
        }

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

        // featured filter
        if(featured === "true"){
            filter.isFeatured = true
        }

        // breaking filter
        if(breaking === "true"){
            filter.isBreaking = true
        }

        const articles = await articleModel
            .find(filter)
            .populate("category", "name slug")
            .populate("author", "name")
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

        const article = await articleModel
            .findOneAndUpdate(
                { slug, isPublished: true },
                { $inc: { views: 1 } },
                { new: true }
            )
            .populate("category", "name slug")
            .populate("author", "name")

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
            .find({ isPublished: true })
            .sort({ views: -1 })
            .limit(5)
            .populate("category", "name slug")
            .populate("author", "name")

        res.json({
            success:true,
            count: articles.length,
            articles
        })

    }catch(err){
        next(err)
    }
}
async function updateArticle(req,res,next) {
    try{
        const { id } = req.params

        const {
            title,
            summary,
            content,
            category,
            isFeatured,
            isBreaking
        } = req.body

        const article = await articleModel.findById(id)

        if(!article){
            return res.status(404).json({
                success:false,
                message:"Article not found"
            })
        }

        // update fields
        if(title){
            article.title = title
            article.slug = slugify(title,{ lower:true })
        }

        if(summary) article.summary = summary
        if(content) article.content = content
        if(category) article.category = category

        if(isFeatured !== undefined) article.isFeatured = isFeatured
        if(isBreaking !== undefined) article.isBreaking = isBreaking

        // update image
        if(req.file){
            article.image = `/uploads/${req.file.filename}`
        }

        await article.save()

        res.json({
            success:true,
            message:"Article updated successfully",
            article
        })

    }catch(err){
        next(err)
    }
}
async function deleteArticle(req,res,next) {
    try{
        const { id } = req.params

        const article = await articleModel.findByIdAndDelete(id)

        if(!article){
            return res.status(404).json({
                success:false,
                message:"Article not found"
            })
        }

        res.json({
            success:true,
            message:"Article deleted successfully"
        })

    }catch(err){
        next(err)
    }
}
async function togglePublish(req,res,next) {
    try{
        const { id } = req.params

        const article = await articleModel.findById(id)

        if(!article){
            return res.status(404).json({
                success:false,
                message:"Article not found"
            })
        }

        article.isPublished = !article.isPublished
        await article.save()

        res.json({
            success:true,
            message:"Publish status updated",
            isPublished: article.isPublished
        })

    }catch(err){
        next(err)
    }
}
async function toggleFeatured(req,res,next) {
    try{
        const { id } = req.params

        const article = await articleModel.findById(id)

        if(!article){
            return res.status(404).json({
                success:false,
                message:"Article not found"
            })
        }

        article.isFeatured = !article.isFeatured
        await article.save()

        res.json({
            success:true,
            isFeatured: article.isFeatured
        })

    }catch(err){
        next(err)
    }
}
async function toggleBreaking(req,res,next) {
    try{
        const { id } = req.params

        const article = await articleModel.findById(id)

        if(!article){
            return res.status(404).json({
                success:false,
                message:"Article not found"
            })
        }

        article.isBreaking = !article.isBreaking
        await article.save()

        res.json({
            success:true,
            isBreaking: article.isBreaking
        })

    }catch(err){
        next(err)
    }
}


module.exports = {createArticle ,getArticles ,getArticleBySlug ,getTrendingArticles ,updateArticle ,deleteArticle ,togglePublish ,toggleFeatured ,toggleBreaking}