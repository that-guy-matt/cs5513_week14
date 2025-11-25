// Import function to fetch and sort post data from JSON
import { getSortedPostsData } from '../lib/posts';

// Import <Head> for setting metadata (title, etc.)
import Head from 'next/head';

// Import layout wrapper component (provides consistent structure)
// `siteTitle` is a constant exported from Layout (likely the website title)
import Layout, { siteTitle } from '../components/layout';

// Import CSS modules for scoped styling
import utilStyles from '../styles/utils.module.css';

// Import Next.js Link for client-side navigation
import Link from 'next/link';

// Import custom Date component to format date strings
import Date from '../components/date';


// --- Next.js data fetching: getStaticProps ---
// Runs at build time to fetch data needed for this page
export async function getStaticProps() {
  // Get posts data (sorted alphabetically by title in your current code)
  const allPostsData = await getSortedPostsData();

  // Return as props so the Home component can use it
  return {
    props: {
      allPostsData,
    },
  } 
}


// --- Page Component: Home ---
// This is the default export for the homepage (`/`)
export default function Home({ allPostsData }) {
  return (
    // Use the Layout wrapper; passing `home` might trigger special styling/behavior
    <Layout home>
      
      {/* Set the HTML document <title> dynamically */}
      <Head>
        <title>{siteTitle}</title>
      </Head>

      {/* Intro section with a short bio */}
      <section className={utilStyles.headingMd}>
        <p className="intro">
          Hi, I’m Matthew — a student learning web development and exploring 
          how to build modern applications with tools like JavaScript, React, and Next.js. 
          I’m interested in solving problems, picking up new skills, and experimenting with technology.
        </p> 
      </section>

      {/* Blog list section */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Cool Books I've Read</h2>

        {/* Render blog posts as a list */}
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title, author }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual post page (dynamic route: /posts/[id]) */}
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              {author && (
                <small className={utilStyles.lightText}>
                  By {author}
                </small>
              )}
              <br />

              {/* Display post date formatted via Date component */}
              <small className={`${utilStyles.lightText} ${utilStyles.smallText}`}>
                Posted: <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
