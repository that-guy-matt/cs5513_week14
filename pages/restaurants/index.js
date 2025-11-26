import Head from 'next/head';
import Link from 'next/link';

import Layout from '../../components/layout';
import Date from '../../components/date';
import { TRAVEL_POST_TYPES, TRAVEL_POST_TYPE_KEYS } from '../../lib/travelTypes';
import utilStyles from '../../styles/utils.module.css';

// This file renders the list page for all "restaurant" posts
const TYPE_KEY = 'restaurant';

export async function getStaticProps() {
  // Dynamically import data-fetching helper for this post type
  const { getPostsByType } = await import('../../lib/posts');

  // Load all posts belonging to this type
  const posts = await getPostsByType(TYPE_KEY);

  return {
    props: {
      posts, // Pass posts into the component tree
    },
    revalidate: 300, // Regenerate via ISR every 5 minutes
  };
}

export default function RestaurantsPage({ posts }) {
  // Configuration object for this type (label, paths, etc.)
  const config = TRAVEL_POST_TYPES[TYPE_KEY];

  // List of all OTHER post types (used for “Keep exploring” section)
  const otherTypes = TRAVEL_POST_TYPE_KEYS.filter((key) => key !== TYPE_KEY);

  return (
    <Layout>
      <Head>
        {/* Dynamic page title */}
        <title>{config.label}</title>
      </Head>

      {/* Page header / hero section */}
      <section className={utilStyles.listHero}>
        <h1 className={utilStyles.headingLg}>{config.label}</h1>
        <p>Hand-picked spots to eat and drink around the world.</p>
      </section>

      {/* Main list of restaurant posts */}
      <section className={utilStyles.headingMd}>
        <ul className={utilStyles.list}>
          {posts.map((post) => (
            <li className={utilStyles.listItem} key={post.id}>
              {/* Post title */}
              <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
              <br />

              {/* Metadata: date + cuisine + price range (if provided) */}
              <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                <Date dateString={post.date} />
                {post.fields.cuisine && ` • ${post.fields.cuisine}`}
                {post.fields.price_range && ` • ${post.fields.price_range}`}
              </small>
            </li>
          ))}
        </ul>
      </section>

      {/* Navigation to other post categories */}
      <section className={utilStyles.headingMd}>
        <h2 className={utilStyles.headingLg}>Keep exploring</h2>
        <ul className={`${utilStyles.list} ${utilStyles.subList}`}>
          {otherTypes.map((typeKey) => (
            <li className={utilStyles.subListItem} key={typeKey}>
              <Link href={TRAVEL_POST_TYPES[typeKey].listPath}>
                {TRAVEL_POST_TYPES[typeKey].label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
