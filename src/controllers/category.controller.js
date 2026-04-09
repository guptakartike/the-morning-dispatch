const categoryModel = require('../models/category.model')
const articleModel = require('../models/article.model')
const jwt = require('jsonwebtoken')
const slugify = require("slugify")

async function createCategory(req,res,next) {
    try{
        const {name} = req.body
        
        if(!name){
            return res.status(401).json({
                message:"Category name required"
            })
        }
        
        
        //slug
        const slug = slugify(name, { lower: true })
        const doesCategoryExists = await categoryModel.findOne({slug})
        
        if(doesCategoryExists){
            return res.status(409).json({
                message:"Category already exists"
            })
        }
        
        const category = await categoryModel.create({
            name,slug
        })

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        })

    }catch(err){
        next(err)
    }
}


async function getCategory(req,res,next) {
    try{

        const categories = await categoryModel.find().sort({ createdAt: -1 })

        res.json({
            success:true,
            count: categories.length,
            categories
        })


    }catch(err){
        next(err)
    }
}


async function getCategoryBySlug(req,res,next) {
    try{
        const {slug} = req.params
        const category = await categoryModel.findOne({slug})

        if(!category){
            return res.status(404).json({
                success:false,
                message:"Category not found"
            })
        }

        res.json({
            success:true,
            category
        })

    }catch(err){
        next(err)
    }
}


async function updateCategory(req,res,next) {
    try{

        const name = req.body.name
        const id = req.params.id

        if(!name){
            return res.status(401).json({
            message:"category name not found"
        })
        }

        const slug = slugify(name,{lower:true})

        const category = await categoryModel.findByIdAndUpdate(
            id,{name,slug},{new:true}
        )

        if(!category){
            return res.status(404).json({
                success:false,
                message:"Category not found"
            })
        }

        res.json({
            success:true,
            message:"Category updated successfully",
            category
        })


    }catch(err){
        next(err)
    }
}


async function deleteCategory(req,res,next) {
    try{
        const id = req.params.id

        const articleInCategory = await articleModel.findOne({category:id})

        if(articleInCategory){
            return res.status(409).json({
                message:"Article exists in the selected category"
            })
        }

        const category = await categoryModel.findByIdAndDelete(id)

        if(!category){
            return res.status(404).json({
                success:false,
                message:"Category not found"
            })
        }

        res.json({
            success:true,
            message:"Category deleted successfully"
        })
        

    }catch(err){
        next(err)
    }
}

module.exports = {createCategory,getCategory,getCategoryBySlug,updateCategory,deleteCategory}