// Import shared layout wrapper for consistent page structure
import Layout from '../../components/layout';

// Import helper functions to fetch data from JSON
import { getAllPostIds, getPostData } from '../../lib/posts';

// Import Next.js <Head> for setting metadata (title, etc.)
import Head from 'next/head';

// Import CSS module for scoped styling
import utilStyles from '../../styles/utils.module.css';


// --- Next.js data fetching: getStaticProps ---
// Runs at build time to fetch data for a single post based on the route parameter
export async function getStaticProps({ params }) {
    // Fetch the full data for the post with the given id
    const postData = await getPostData(params.id);
    return {
        props: {
            postData, // Passed as a prop to the page component
        },
    };
}


// --- Next.js data fetching: getStaticPaths ---
// Tells Next.js which dynamic routes to pre-render at build time
export async function getStaticPaths() {
    // Get all post IDs from WordPress API (await the async function)
    const paths = await getAllPostIds();
    return {
        paths,          // List of routes: e.g. [{ params: { id: '1' } }, ...]
        fallback: false // Any path not returned here will 404
    };
}


// --- Page Component: Post ---
// Renders an individual blog post page
export default function Post({ postData }) {
    return (
        <Layout>
            <Head>
                {/* Set the HTML <title> dynamically */}
                <title>{postData.title}</title>
            </Head>
            <article>
                {/* Book Title */}
                <h1 className={utilStyles.headingX1}>{postData.title}</h1>

                {/* Author */}
                {postData.author && (
                    <div>
                        <strong>Author:</strong> {postData.author}
                    </div>
                )}

                {/* Publisher */}
                {postData.publisher && (
                    <div>
                        <strong>Publisher:</strong> {postData.publisher}
                    </div>
                )}

                {/* Publication Date */}
                {postData.publication_date && (
                    <div className={utilStyles.lightText}>
                        <strong>Publication Date:</strong> {postData.publication_date}
                    </div>
                )}

                {/* Genre */}
                {postData.genre && (
                    <div>
                        <strong>Genre:</strong> {postData.genre}
                    </div>
                )}

                {/* Short Description */}
                {postData.short_description && (
                    <div>
                        <strong>Description:</strong> {postData.short_description}
                    </div>
                )}
            </article>
        </Layout>
    );
}
