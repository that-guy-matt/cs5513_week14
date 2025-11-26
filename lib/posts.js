import got from 'got';

import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from './travelTypes';

// Define the WordPress API base URL
const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL;

function ensureApiBase() {
    if (!WP_API_BASE) {
        throw new Error('Missing NEXT_PUBLIC_WP_API_URL in environment configuration.');
    }
}

function extractStringValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.rendered) return value.rendered;
    if (typeof value === 'object' && typeof value.url === 'string') return value.url;
    if (typeof value === 'object' && value.toString) return value.toString();
    return '';
}

function convertWordPressDateToISO(wpDate) {
    if (!wpDate) return '';
    const dateStr = extractStringValue(wpDate);
    if (!dateStr) return '';
    return dateStr.replace(' ', 'T');
}

async function fetchWordPressPosts(endpoint) {
    ensureApiBase();
    const url = `${WP_API_BASE}/wp/v2/${endpoint}`;

    try {
        const res = await got(url, { responseType: 'json' });
        if (!Array.isArray(res.body)) {
            console.error('Unexpected API response format. Expected array.', res.body);
            return [];
        }
        return res.body;
    } catch (error) {
        console.error(`Error fetching WordPress posts from ${url}:`, error.message);
        return [];
    }
}

function normalizeAcfField(acf, key) {
    if (!acf || typeof acf !== 'object') {
        return '';
    }
    const value = acf[key];
    return extractStringValue(value);
}

function mapTravelPost(post, typeKey) {
    const config = TRAVEL_POST_TYPES[typeKey];
    if (!config) {
        throw new Error(`Unknown travel post type: ${typeKey}`);
    }

    const safeAcf = post && typeof post.acf === 'object' ? post.acf : {};
    const fields = config.detailFields.reduce((acc, field) => {
        acc[field.key] = normalizeAcfField(safeAcf, field.key);
        return acc;
    }, {});

    const summaryFieldKey = ['summary', 'description', 'tip_text'].find((key) => fields[key]);

    return {
        id: (post.id || post.ID || '').toString(),
        type: typeKey,
        label: config.label,
        title: extractStringValue(post.title || post.post_title || ''),
        slug: post.slug || '',
        link: post.link || '',
        date: convertWordPressDateToISO(post.date || post.post_date || ''),
        excerpt: extractStringValue(post.excerpt && post.excerpt.rendered) || (summaryFieldKey ? fields[summaryFieldKey] : ''),
        image: fields.image || '',
        fields,
    };
}

function sortByDateDesc(a, b) {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
}

export async function getPostsByType(typeKey) {
    const config = TRAVEL_POST_TYPES[typeKey];
    if (!config) {
        throw new Error(`Unknown travel post type: ${typeKey}`);
    }

    const posts = await fetchWordPressPosts(config.endpoint);
    return posts.map((post) => mapTravelPost(post, typeKey)).sort(sortByDateDesc);
}

export async function getAllTravelPostsGrouped() {
    const entries = await Promise.all(
        TRAVEL_POST_TYPE_KEYS.map(async (typeKey) => {
            const posts = await getPostsByType(typeKey);
            return [typeKey, posts];
        })
    );

    return Object.fromEntries(entries);
}

export async function getLatestTravelPost() {
    const grouped = await getAllTravelPostsGrouped();
    const combined = Object.values(grouped).flat().sort(sortByDateDesc);
    return combined[0] || null;
}

export async function getAllPostIdsByType(typeKey) {
    const posts = await getPostsByType(typeKey);
    return posts.map((post) => ({
        params: { id: post.id },
    }));
}

export async function getTravelPostData(typeKey, id) {
    const posts = await getPostsByType(typeKey);
    return posts.find((post) => post.id === id) || null;
}

// Legacy exports to avoid breaking existing imports before all pages are updated.
export async function getSortedPostsData() {
    const grouped = await getAllTravelPostsGrouped();
    return Object.values(grouped).flat().sort(sortByDateDesc);
}

export async function getAllPostIds() {
    const grouped = await getAllTravelPostsGrouped();
    return Object.values(grouped)
        .flat()
        .map((post) => ({
            params: { id: post.id },
        }));
}

export async function getPostData(id) {
    const grouped = await getAllTravelPostsGrouped();
    const combined = Object.values(grouped).flat();
    return combined.find((post) => post.id === id) || null;
}
