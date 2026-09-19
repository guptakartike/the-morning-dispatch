require('dotenv').config()
const axios = require('axios')
const crypto = require('crypto')
const Article = require('../models/article.model')
const { getSource } = require('../config/sources')

const fetchNewsBySource = async (sourceSlug) => {
    const sourceConfig = getSource(sourceSlug)
    if (!sourceConfig) {
        console.error(`Unsupported source: "${sourceSlug}". Ingestion skipped.`)
        return
    }

    console.log(`Fetching ${sourceConfig.sourceSlug} news...`)
    const response = await axios.get(
        'https://newsapi.org/v2/top-headlines',
        {
            params: {
                sources: sourceConfig.newsApiId,
                apiKey: process.env.NEWS_API_KEY
            }
        }
    )

    const articles = response.data.articles
    console.log(articles.length)

    const normalisedArticles = articles.map((article) => {
        const uniqueString = article.title + article.publishedAt + sourceConfig.sourceSlug

        const sourceArticleId = crypto.createHash("md5").update(uniqueString).digest("hex")

        return {
            sourceArticleId: sourceArticleId,
            title: article.title,
            description: article.description || "",
            url: article.url,
            imageUrl: article.urlToImage,
            source: article.source?.name || sourceConfig.name,
            sourceSlug: sourceConfig.sourceSlug,
            topic: "general",
            publishedAt: article.publishedAt,
            fetchedAt: new Date()
        }
    })

    try {
        const insertedArticles = await Article.insertMany(
            normalisedArticles,
            {
                ordered: false,
            }
        )

        console.log(`Inserted ${insertedArticles.length} articles`)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    fetchNewsBySource
}