import got from 'got';

// Define the WordPress API base URL
const WP_API_BASE = process.env.NEXT_PUBLIC_WP_API_URL;

// Helper function to extract string value from WordPress API response
// Handles both plain strings and objects with 'rendered' property
function extractStringValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.rendered) return value.rendered;
    if (typeof value === 'object' && value.toString) return value.toString();
    return '';
}

// Helper function to convert WordPress date format to ISO format
// WordPress: "YYYY-MM-DD HH:mm:ss" -> ISO: "YYYY-MM-DDTHH:mm:ss"
function convertWordPressDateToISO(wpDate) {
    if (!wpDate) return '';
    // Handle object with rendered property
    const dateStr = extractStringValue(wpDate);
    if (!dateStr) return '';
    // Replace space with 'T' to convert to ISO format
    return dateStr.replace(' ', 'T');
}

// Fetch JSON from custom wp endpoint /books
async function fetchWordPressPosts() {
    if (!WP_API_BASE) {
        throw new Error("Missing NEXT_PUBLIC_WP_API_URL in .env file.");
    }

    // Append the WordPress REST API path to the base URL
    const endpoint = `${WP_API_BASE}/wp/v2/book`;

    try {
        const res = await got(endpoint, {responseType: "json" });

        // WordPress returns an array directly, not wrapped in { posts: [...] }
        if (!Array.isArray(res.body)) {
            console.error("Unexpected API response format. Expected array. Got:", typeof res.body);
            console.error("Response body:", JSON.stringify(res.body, null, 2));
            return [];
        }


        return res.body || [];
    } catch (error) {
        console.error("Error fetching WordPress posts: ", error.message);
        return [];
    }
}

// --- Function: Return sorted list of posts (id, title, date) ---
export async function getSortedPostsData() {
    const posts = await fetchWordPressPosts(); 

    if (!posts || posts.length === 0) {
        console.log("No posts found or empty array returned");
        return [];
    }

    // Sort posts alphabetically by title
    posts.sort(function (a, b) {
        const titleA = extractStringValue(a.post_title || a.title || '');
        const titleB = extractStringValue(b.post_title || b.title || '');
        return titleA.localeCompare(titleB);
    });

    // Map WordPress fields to expected format: ID→id, post_title→title, post_date→date
    const mappedPosts = posts.map(post => {
        // Extract ACF fields - check both acf object and top-level fields
        const acf = post.acf || {};
        
        const mapped = {
            id: (post.id || post.ID || '').toString(),
            title: extractStringValue(post.post_title || post.title || ''),
            date: convertWordPressDateToISO(post.post_date || post.date || ''),
            author: extractStringValue(acf.author || post.author || ''),
        };
        console.log("Mapped post:", mapped);
        return mapped;
    });

    return mappedPosts;
}

// --- Function: Return all post IDs (for Next.js dynamic routing) ---
export async function getAllPostIds() {
    const posts = await fetchWordPressPosts();

    if (!posts || posts.length === 0) {
        return [];
    }

    // Next.js requires IDs to be nested inside { params: { id: ... } }
    return posts.map(post => {
        return {
            params: {
                id: (post.id || post.ID || '').toString(),
            }
        }
    });
}

// --- Function: Return full post data by ID ---
export async function getPostData(id) {
    const posts = await fetchWordPressPosts();

    // Filter posts to find the one matching the given ID
    const match = posts.find(post => {
        const postId = (post.id || post.ID || '').toString();
        return postId === id;
    });

    // If no match, return a placeholder "empty" object
    if (!match) {
        return {
            id: '',
            title: '',
            publication_date: '',
            author: '',
            publisher: '',
            genre: '',
            short_description: '',
        }
    } else {
        // Extract ACF fields - check both acf object and top-level fields
        const acf = match.acf || {};
        
        // Map WordPress fields to expected format with ACF fields
        return {
            id: (match.id || match.ID || '').toString(),
            title: extractStringValue(match.post_title || match.title || ''),
            publication_date: extractStringValue(acf.publication_date || match.publication_date || ''),
            author: extractStringValue(acf.author || match.author || ''),
            publisher: extractStringValue(acf.publisher || match.publisher || ''),
            genre: extractStringValue(acf.genre || match.genre || ''),
            short_description: extractStringValue(acf.short_description || match.short_description || ''),
        };
    }
}
