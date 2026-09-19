const articleModel = require('../models/article.model')

async function getArticles(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const { source, topic } = req.query;

        let filter = {};

        if (source) {
            filter.source = source;
        }

        if (topic) {
            filter.topic = topic;
        }

        const articles = await articleModel
            .find(filter)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await articleModel.countDocuments(filter);
        const pages = Math.ceil(total / limit);

        res.json({
            articles,
            pagination: {
                page,
                limit,
                total,
                pages
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getArticles };