import got from 'got';

import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from './travelTypes';

// Define the WordPress API base URL
const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL;
const termCache = new Map();
const mediaCache = new Map();

function ensureApiBase() {
    if (!WP_API_BASE) {
        throw new Error('Missing NEXT_PUBLIC_WP_API_URL in environment configuration.');
    }
}

function extractStringValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (value.rendered) return value.rendered;
        if (value.name) return value.name;
        if (value.label) return value.label;
        if (typeof value.url === 'string') return value.url;
        if (typeof value.source_url === 'string') return value.source_url;
    }
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

function extractAcfValue(rawValue) {
    if (Array.isArray(rawValue)) {
        return rawValue.map((value) => extractStringValue(value)).filter(Boolean).join(', ');
    }
    return extractStringValue(rawValue);
}

function normalizeNumericId(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toString();
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return /^\d+$/.test(trimmed) ? trimmed : null;
    }
    return null;
}

async function fetchTermNameByHref(href) {
    if (!href) {
        return '';
    }

    if (termCache.has(href)) {
        return termCache.get(href);
    }

    const url = href.includes('?') ? `${href}&_fields=name` : `${href}?_fields=name`;
    try {
        const res = await got(url, { responseType: 'json' });
        const name = extractStringValue(res.body?.name);
        termCache.set(href, name);
        return name;
    } catch (error) {
        console.error(`Error fetching term from ${href}:`, error.message);
        termCache.set(href, '');
        return '';
    }
}

async function expandTermValues(rawValue, post) {
    if (!rawValue) {
        return rawValue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const links = post?._links?.['acf:term'] || [];
    if (!links.length) {
        return rawValue;
    }

    const resolved = [];
    for (const value of values) {
        const id = normalizeNumericId(value);
        if (!id) {
            resolved.push(value);
            continue;
        }

        const link = links.find((entry) => entry?.href && entry.href.includes(`/${id}`));
        if (!link) {
            resolved.push(value);
            continue;
        }

        const name = await fetchTermNameByHref(link.href);
        resolved.push(name || value);
    }

    return Array.isArray(rawValue) ? resolved : resolved[0];
}

async function fetchMediaUrlById(id) {
    if (!id && id !== 0) {
        return '';
    }

    const cacheKey = id.toString();
    if (mediaCache.has(cacheKey)) {
        return mediaCache.get(cacheKey);
    }

    ensureApiBase();
    const url = `${WP_API_BASE}/wp/v2/media/${cacheKey}?_fields=source_url`;
    try {
        const res = await got(url, { responseType: 'json' });
        const mediaUrl = extractStringValue(res.body?.source_url);
        mediaCache.set(cacheKey, mediaUrl);
        return mediaUrl;
    } catch (error) {
        console.error(`Error fetching media ${cacheKey}:`, error.message);
        mediaCache.set(cacheKey, '');
        return '';
    }
}

async function normalizeImageValue(rawValue) {
    if (!rawValue) {
        return '';
    }

    if (Array.isArray(rawValue)) {
        // Use the first entry for hero image
        return normalizeImageValue(rawValue[0]);
    }

    if (typeof rawValue === 'object') {
        if (rawValue.url || rawValue.source_url) {
            return extractStringValue(rawValue.url || rawValue.source_url);
        }
        if (rawValue.ID || rawValue.id) {
            return normalizeImageValue(rawValue.ID || rawValue.id);
        }
    }

    if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim();
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed;
        }
        const numeric = normalizeNumericId(trimmed);
        if (numeric) {
            return fetchMediaUrlById(numeric);
        }
        return trimmed;
    }

    if (typeof rawValue === 'number') {
        return fetchMediaUrlById(rawValue);
    }

    return '';
}

async function resolveFieldValue(post, key) {
    if (!post || typeof post !== 'object') {
        return '';
    }

    const acf = post.acf && typeof post.acf === 'object' ? post.acf : {};
    const rawValue = acf[key];

    if (key === 'image') {
        return normalizeImageValue(rawValue);
    }

    const expanded = await expandTermValues(rawValue, post);
    return extractAcfValue(expanded);
}

async function mapTravelPost(post, typeKey) {
    const config = TRAVEL_POST_TYPES[typeKey];
    if (!config) {
        throw new Error(`Unknown travel post type: ${typeKey}`);
    }

    const fieldEntries = await Promise.all(
        config.detailFields.map(async (field) => {
            const value = await resolveFieldValue(post, field.key);
            return [field.key, value];
        })
    );
    const fields = Object.fromEntries(fieldEntries);

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
    const mapped = await Promise.all(posts.map((post) => mapTravelPost(post, typeKey)));
    return mapped.sort(sortByDateDesc);
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
