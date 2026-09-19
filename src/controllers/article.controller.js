const articleModel = require('../models/article.model');

function parseDateParam(val, isEnd = false) {
    if (!val || typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (!trimmed) return null;

    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyRegex.test(trimmed)) {
        const isoString = isEnd ? `${trimmed}T23:59:59.999Z` : `${trimmed}T00:00:00.000Z`;
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return null;
        if (d.toISOString().slice(0, 10) !== trimmed) return null;
        return d;
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    return d;
}

async function getArticles(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const { source, sourceSlug, topic, from, to } = req.query;

        let filter = {};

        if (source) {
            filter.$or = [
                { source: source },
                { sourceSlug: source }
            ];
        } else if (sourceSlug) {
            filter.sourceSlug = sourceSlug;
        }

        if (topic) {
            filter.topic = topic;
        }

        if (from !== undefined || to !== undefined) {
            let fromDate = null;
            let toDate = null;
            let dateFilter = {};

            if (from !== undefined) {
                fromDate = parseDateParam(from, false);
                if (!fromDate) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid 'from' date: "${from}". Expected format: YYYY-MM-DD or valid ISO date.`
                    });
                }
                dateFilter.$gte = fromDate;
            }

            if (to !== undefined) {
                toDate = parseDateParam(to, true);
                if (!toDate) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid 'to' date: "${to}". Expected format: YYYY-MM-DD or valid ISO date.`
                    });
                }
                dateFilter.$lte = toDate;
            }

            if (fromDate && toDate && fromDate > toDate) {
                return res.status(400).json({
                    success: false,
                    message: "'from' date cannot be later than 'to' date."
                });
            }

            filter.publishedAt = dateFilter;
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