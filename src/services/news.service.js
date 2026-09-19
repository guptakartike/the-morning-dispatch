require('dotenv').config()
const axios = require('axios')
const crypto = require('crypto')
const Article = require('../models/article.model')
const { getSource, getAllSources } = require('../config/sources')

const fetchNewsBySource = async (sourceSlug) => {
    const sourceConfig = getSource(sourceSlug)
    if (!sourceConfig) {
        console.error(`Unsupported source: "${sourceSlug}". Ingestion skipped.`)
        return {
            source: sourceSlug,
            sourceName: sourceSlug,
            fetched: 0,
            inserted: 0,
            success: false,
            error: `Unsupported source: "${sourceSlug}"`
        }
    }

    try {
        console.log(`Fetching ${sourceConfig.name} news...`)
        const response = await axios.get(
            'https://newsapi.org/v2/top-headlines',
            {
                params: {
                    sources: sourceConfig.newsApiId,
                    apiKey: process.env.NEWS_API_KEY
                }
            }
        )

        const articles = response.data.articles || []
        console.log(`[${sourceConfig.name}] Fetched ${articles.length} articles from NewsAPI`)

        const normalisedArticles = articles.map((article) => {
            const uniqueString = (article.title || "") + (article.publishedAt || "") + sourceConfig.sourceSlug
            const sourceArticleId = crypto.createHash("md5").update(uniqueString).digest("hex")

            return {
                sourceArticleId: sourceArticleId,
                title: article.title,
                description: article.description || "",
                url: article.url,
                imageUrl: article.urlToImage || "",
                source: article.source?.name || sourceConfig.name,
                sourceSlug: sourceConfig.sourceSlug,
                topic: "general",
                publishedAt: article.publishedAt,
                fetchedAt: new Date()
            }
        })

        let insertedCount = 0
        if (normalisedArticles.length > 0) {
            try {
                const insertedArticles = await Article.insertMany(
                    normalisedArticles,
                    {
                        ordered: false,
                    }
                )
                insertedCount = insertedArticles.length
                console.log(`[${sourceConfig.name}] Inserted ${insertedCount} articles`)
            } catch (error) {
                if (error.code === 11000 || error.name === 'MongoBulkWriteError') {
                    insertedCount = error.result ? error.result.insertedCount : 0
                    console.log(`[${sourceConfig.name}] Inserted ${insertedCount} new articles (duplicates skipped)`)
                } else {
                    console.error(`[${sourceConfig.name}] Insert error:`, error.message)
                    throw error
                }
            }
        } else {
            console.log(`[${sourceConfig.name}] 0 articles to insert`)
        }

        return {
            source: sourceConfig.sourceSlug,
            sourceName: sourceConfig.name,
            fetched: articles.length,
            inserted: insertedCount,
            success: true
        }
    } catch (error) {
        console.error(`[${sourceConfig.name}] Ingestion failed: ${error.message}`)
        return {
            source: sourceConfig.sourceSlug,
            sourceName: sourceConfig.name,
            fetched: 0,
            inserted: 0,
            success: false,
            error: error.message
        }
    }
}

const fetchAllSources = async () => {
    const sources = getAllSources()
    console.log(`Starting multi-source ingestion for ${sources.length} sources...`)

    const results = await Promise.allSettled(
        sources.map((sourceConfig) => fetchNewsBySource(sourceConfig.sourceSlug))
    )

    const summary = results.map((result, idx) => {
        const sourceConfig = sources[idx]
        if (result.status === "fulfilled" && result.value) {
            return result.value
        } else {
            return {
                source: sourceConfig.sourceSlug,
                sourceName: sourceConfig.name,
                fetched: 0,
                inserted: 0,
                success: false,
                error: result.reason ? result.reason.message : "Unknown error"
            }
        }
    })

    console.log("=== Multi-Source Ingestion Summary ===")
    summary.forEach((item) => {
        if (item.success) {
            console.log(`✓ [${item.sourceName}] Fetched: ${item.fetched}, Inserted: ${item.inserted}`)
        } else {
            console.log(`✗ [${item.sourceName}] Failed: ${item.error}`)
        }
    })

    return summary
}

module.exports = {
    fetchNewsBySource,
    fetchAllSources
}