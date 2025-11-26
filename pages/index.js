// Import core Next.js utilities
import Head from 'next/head';
import Link from 'next/link';

// Import layout and shared components
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';

// Import your custom post-type constants
import { TRAVEL_POST_TYPE_KEYS, TRAVEL_POST_TYPES } from '../lib/travelTypes';

// Import CSS modules (scoped styles)
import utilStyles from '../styles/utils.module.css';
import homeStyles from '../styles/Home.module.css';

// Max number of posts to show in each homepage column
const MAX_COLUMN_ITEMS = 5;

// Next.js data fetching function (runs at build time + ISR)
export async function getStaticProps() {
  // Dynamically import the post loader to reduce initial bundle size
  const { getAllTravelPostsGrouped } = await import('../lib/posts');

  // Get posts grouped by custom post type (Destinations, Tips, Restaurants)
  const groupedPosts = await getAllTravelPostsGrouped();

  // Determine the newest post across **all** post types to feature
  const featuredPost =
    Object.values(groupedPosts)
      .flat() // flatten grouped posts into a single array
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0] || null;

  return {
    props: {
      groupedPosts,
      featuredPost,
    },
    // Revalidate every 5 minutes (ISR – keeps data fresh)
    revalidate: 300,
  };
}

// Main homepage component
export default function Home({ groupedPosts, featuredPost }) {
  return (
    <Layout home>
      <Head>
        {/* Document <title> */}
        <title>{siteTitle}</title>
      </Head>

      {/* Featured post section (only renders if a recent post exists) */}
      {featuredPost && (
        <section className={homeStyles.featured}>
          {/* Small badge showing the post type (e.g. Destination, Tip, Restaurant) */}
          <span className={homeStyles.typeBadge}>
            {TRAVEL_POST_TYPES[featuredPost.type].label}
          </span>

          {/* Featured post title */}
          <h1 className={homeStyles.featuredTitle}>
            <Link href={`${TRAVEL_POST_TYPES[featuredPost.type].detailPath}/${featuredPost.id}`}>
              {featuredPost.title}
            </Link>
          </h1>

          {/* Publish date */}
          <div className={homeStyles.featuredMeta}>
            <Date dateString={featuredPost.date} />
          </div>

          {/* Short description or fallback placeholder */}
          <p className={homeStyles.featuredExcerpt}>
            {featuredPost.excerpt || 'Discover the latest travel insight from our community.'}
          </p>

          {/* Link to the full article */}
          <Link
            href={`${TRAVEL_POST_TYPES[featuredPost.type].detailPath}/${featuredPost.id}`}
            className={homeStyles.featuredLink}
          >
            Read more →
          </Link>
        </section>
      )}

      {/* 3-column wrapper: Destinations, Travel Tips, Restaurants */}
      <section className={homeStyles.columnsWrapper}>
        <div className={homeStyles.columns}>
          {TRAVEL_POST_TYPE_KEYS.map((typeKey) => {
            // Get post-type-specific settings and posts
            const config = TRAVEL_POST_TYPES[typeKey];
            const posts = (groupedPosts[typeKey] || []).slice(0, MAX_COLUMN_ITEMS);

            return (
              <div className={homeStyles.column} key={typeKey}>
                {/* Column header with title + small "View all" link */}
                <div className={homeStyles.columnHeader}>
                  <h2>{config.label}</h2>
                  <Link href={config.listPath}>View all</Link>
                </div>

                {/* List of posts for this post type */}
                <ul className={utilStyles.list}>
                  {/* If no posts, show placeholder */}
                  {posts.length === 0 && (
                    <li className={utilStyles.listItem}>
                      <small className={utilStyles.lightText}>No posts yet.</small>
                    </li>
                  )}

                  {/* Render each post in the column */}
                  {posts.map((post) => (
                    <li className={utilStyles.listItem} key={post.id}>
                      <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
                      <br />
                      {/* Display publish date in smaller, lighter text */}
                      <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                        <Date dateString={post.date} />
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
