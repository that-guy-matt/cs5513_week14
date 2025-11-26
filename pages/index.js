import Head from 'next/head';
import Link from 'next/link';

import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { TRAVEL_POST_TYPE_KEYS, TRAVEL_POST_TYPES } from '../lib/travelTypes';
import utilStyles from '../styles/utils.module.css';
import homeStyles from '../styles/Home.module.css';

const MAX_COLUMN_ITEMS = 5;

export async function getStaticProps() {
  const { getAllTravelPostsGrouped } = await import('../lib/posts');
  const groupedPosts = await getAllTravelPostsGrouped();
  const featuredPost =
    Object.values(groupedPosts)
      .flat()
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0] || null;

  return {
    props: {
      groupedPosts,
      featuredPost,
    },
    revalidate: 300,
  };
}

export default function Home({ groupedPosts, featuredPost }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      {featuredPost && (
        <section className={homeStyles.featured}>
          <span className={homeStyles.typeBadge}>
            {TRAVEL_POST_TYPES[featuredPost.type].label}
          </span>
          <h1 className={homeStyles.featuredTitle}>
            <Link href={`${TRAVEL_POST_TYPES[featuredPost.type].detailPath}/${featuredPost.id}`}>
              {featuredPost.title}
            </Link>
          </h1>
          <div className={homeStyles.featuredMeta}>
            <Date dateString={featuredPost.date} />
          </div>
          <p className={homeStyles.featuredExcerpt}>
            {featuredPost.excerpt || 'Discover the latest travel insight from our community.'}
          </p>
          <Link
            href={`${TRAVEL_POST_TYPES[featuredPost.type].detailPath}/${featuredPost.id}`}
            className={homeStyles.featuredLink}
          >
            Read more →
          </Link>
        </section>
      )}

      <section className={homeStyles.columnsWrapper}>
        <div className={homeStyles.columns}>
          {TRAVEL_POST_TYPE_KEYS.map((typeKey) => {
            const config = TRAVEL_POST_TYPES[typeKey];
            const posts = (groupedPosts[typeKey] || []).slice(0, MAX_COLUMN_ITEMS);

            return (
              <div className={homeStyles.column} key={typeKey}>
                <div className={homeStyles.columnHeader}>
                  <h2>{config.label}</h2>
                  <Link href={config.listPath}>View all</Link>
                </div>
                <ul className={utilStyles.list}>
                  {posts.length === 0 && (
                    <li className={utilStyles.listItem}>
                      <small className={utilStyles.lightText}>No posts yet.</small>
                    </li>
                  )}
                  {posts.map((post) => (
                    <li className={utilStyles.listItem} key={post.id}>
                      <Link href={`${config.detailPath}/${post.id}`}>{post.title}</Link>
                      <br />
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
