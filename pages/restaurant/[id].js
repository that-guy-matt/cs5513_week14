import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import TravelPostDetail from '../../components/travel-post-detail';
import { TRAVEL_POST_TYPES } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

// This file renders the detail page for a single "restaurant" post.
const TYPE_KEY = 'restaurant';

export async function getStaticPaths() {
  // Dynamically import helper to avoid unnecessarily loading code in bundle
  const { getAllPostIdsByType } = await import('../../lib/posts');

  // Get a list of all post IDs for this type
  // Example: [{ params: { id: 'tacos-el-gordo' } }, ...]
  const paths = await getAllPostIdsByType(TYPE_KEY);

  return {
    paths,               // Pre-render these paths at build time
    fallback: 'blocking', // On-demand ISR for new posts not built yet
  };
}

export async function getStaticProps({ params }) {
  // Dynamically load data fetching helper
  const { getTravelPostData } = await import('../../lib/posts');

  // Load the post data for the given restaurant ID
  const post = await getTravelPostData(TYPE_KEY, params.id);

  // If the post doesn't exist, show a 404 but try again soon
  if (!post) {
    return {
      notFound: true,
      revalidate: 60, // Retry in 1 minute in case the file appears later
    };
  }

  return {
    props: {
      post, // Pass post data to the component
    },
    revalidate: 300, // Re-generate every 5 minutes via ISR
  };
}

export default function RestaurantPost({ post }) {
  // Pull configuration for this post type (paths, labels, etc.)
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  return (
    <Layout>
      <Head>
        {/* Set page title dynamically (fallback to generic label) */}
        <title>{post?.title || config.label}</title>
      </Head>

      {/* Render the main post detail component */}
      <TravelPostDetail post={post} config={config} />

      {/* Back-to-list navigation */}
      <section className={utilStyles.headingMd}>
        <Link href={config.listPath}>← Back to {config.label}</Link>
      </section>
    </Layout>
  );
}
