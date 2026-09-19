require('dotenv').config()
const axios = require('axios')
const crypto = require('crypto')
const Article = require('../models/article.model')
const { getSource, getAllSources } = require('../config/sources')

const fetchNewsBySource = async (sourceSlug) => {
    const sourceConfig = getSource(sourceSlug);
    if (!sourceConfig) {
        console.error(`Unsupported source: "${sourceSlug}". Ingestion skipped.`);
        return {
            source: sourceSlug,
            sourceSlug,
            fetched: 0,
            inserted: 0,
            success: false,
            error: `Unsupported source: "${sourceSlug}"`
        };
    }

    try {
        console.log(`Fetching ${sourceConfig.name} news...`);
        const response = await axios.get(
            'https://newsapi.org/v2/top-headlines',
            {
                params: {
                    sources: sourceConfig.newsApiId,
                    apiKey: process.env.NEWS_API_KEY
                }
            }
        );

        const articles = response.data.articles || [];
        console.log(`[${sourceConfig.name}] Fetched ${articles.length} articles from NewsAPI`);

        if (articles.length === 0) {
            return {
                source: sourceConfig.sourceSlug,
                sourceName: sourceConfig.name,
                fetched: 0,
                inserted: 0,
                updated: 0,
                failed: 0,
                success: true
            };
        }

        const normalisedArticles = articles.map((article) => {
            const uniqueString = article.title + article.publishedAt + sourceConfig.sourceSlug;
            const sourceArticleId = crypto.createHash("md5").update(uniqueString).digest("hex");

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
            };
        });

        const operations = normalisedArticles.map((article) => ({
            updateOne: {
                filter: { sourceArticleId: article.sourceArticleId },
                update: {
                    $set: {
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        imageUrl: article.imageUrl,
                        source: article.source,
                        sourceSlug: article.sourceSlug,
                        topic: article.topic,
                        publishedAt: article.publishedAt,
                        fetchedAt: article.fetchedAt,
                        updatedAt: new Date()
                    },
                    $setOnInsert: {
                        sourceArticleId: article.sourceArticleId,
                        createdAt: new Date()
                    }
                },
                upsert: true
            }
        }));

        let inserted = 0;
        let updated = 0;
        let failed = 0;

        try {
            const bulkResult = await Article.bulkWrite(operations, { ordered: false });
            inserted = bulkResult.upsertedCount || 0;
            updated = bulkResult.modifiedCount || 0;
            failed = 0;
            console.log(`[${sourceConfig.name}] Ingestion complete: ${inserted} inserted, ${updated} updated, ${failed} failed`);
        } catch (dbError) {
            if (dbError.result) {
                inserted = dbError.result.upsertedCount || 0;
                updated = dbError.result.modifiedCount || 0;
                failed = dbError.writeErrors ? dbError.writeErrors.length : 1;
                console.warn(`[${sourceConfig.name}] Bulk write partial failure: ${inserted} inserted, ${updated} updated, ${failed} failed`);
            } else {
                console.error(`[${sourceConfig.name}] Database write error:`, dbError.message);
                throw dbError;
            }
        }

        return {
            source: sourceConfig.sourceSlug,
            sourceName: sourceConfig.name,
            fetched: articles.length,
            inserted,
            updated,
            failed,
            success: failed === 0 || (inserted + updated > 0)
        };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error(`[${sourceConfig.name}] Fetch error:`, errMsg);
        return {
            source: sourceConfig.sourceSlug,
            sourceName: sourceConfig.name,
            fetched: 0,
            inserted: 0,
            updated: 0,
            failed: 0,
            success: false,
            error: errMsg
        };
    }
};

const fetchAllSources = async () => {
    const sources = getAllSources();
    console.log(`Starting multi-source ingestion for ${sources.length} sources...`);

    const results = await Promise.allSettled(
        sources.map((source) => fetchNewsBySource(source.sourceSlug))
    );

    const summary = results.map((res, index) => {
        const source = sources[index];
        if (res.status === 'fulfilled') {
            return res.value;
        } else {
            return {
                source: source.sourceSlug,
                sourceName: source.name,
                fetched: 0,
                inserted: 0,
                updated: 0,
                failed: 1,
                success: false,
                error: res.reason?.message || 'Unknown error'
            };
        }
    });

    console.log('\n=== Ingestion Summary ===');
    summary.forEach((item) => {
        if (item.success) {
            console.log(`✓ ${item.sourceName || item.source} (${item.source}): ${item.fetched} fetched, ${item.inserted} inserted, ${item.updated} updated, ${item.failed} failed`);
        } else {
            console.log(`✗ ${item.sourceName || item.source} (${item.source}): Failed (${item.error})`);
        }
    });
    console.log('=========================\n');

    return summary;
};

module.exports = {
    fetchNewsBySource,
    fetchAllSources
};