// Add page <head> tags (title, meta, etc.)
import Head from 'next/head';
// Next.js client-side navigation
import Link from 'next/link';

// Layout wrapper for consistent page structure
import Layout from '../../components/layout';

// Component that displays a full travel post
import TravelPostDetail from '../../components/travel-post-detail';

// Config for post types (e.g., label, paths)
import { TRAVEL_POST_TYPES } from '../../lib/travelTypes';

// Utility CSS classes
import utilStyles from '../../styles/utils.module.css';

// This file handles the Destination post type
const TYPE_KEY = 'destination';

// getStaticPaths: Pre-generates dynamic routes for [id].js
export async function getStaticPaths() {
  // Load helper to fetch available IDs for this post type
  const { getAllPostIdsByType } = await import('../../lib/posts');

  // Build an array of paths: [{ params: { id: '...' } }]
  const paths = await getAllPostIdsByType(TYPE_KEY);

  return {
    paths,
    // 'blocking' generates new pages on-demand (ISR)
    fallback: 'blocking',
  };
}

// getStaticProps: Fetch data for a single destination post
export async function getStaticProps({ params }) {
  // Import only when needed (saves bundle size)
  const { getTravelPostData } = await import('../../lib/posts');

  // Load the post data by type and ID
  const post = await getTravelPostData(TYPE_KEY, params.id);

  // If post doesn't exist → return 404 with short revalidate
  if (!post) {
    return {
      notFound: true,
      revalidate: 60, // re-check soon in case post is added later
    };
  }

  return {
    props: {
      post,
    },
    // Revalidate every 5 minutes (Incremental Static Regeneration)
    revalidate: 300,
  };
}

// Page Component: Renders a Destination post
export default function DestinationPost({ post }) {
  // Get label + path info for this post type
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  return (
    <Layout>
      <Head>
        {/* Use post title if available, fallback to generic label */}
        <title>{post?.title || config.label}</title>
      </Head>

      {/* Dedicated detail component to render the post fields */}
      <TravelPostDetail post={post} config={config} />

      {/* Back link to the Destination list page */}
      <section className={utilStyles.headingMd}>
        <Link href={config.listPath}>← Back to {config.label}</Link>
      </section>
    </Layout>
  );
}

