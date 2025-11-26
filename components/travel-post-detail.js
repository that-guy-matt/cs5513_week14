import Date from './date';
import styles from './travel-post-detail.module.css';

export default function TravelPostDetail({ post, config }) {
  if (!post) {
    return null;
  }

  return (
    <article className={styles.detail}>
      <p className={styles.type}>{config.label}</p>
      <h1 className={styles.title}>{post.title}</h1>
      <div className={styles.meta}>
        <Date dateString={post.date} />
      </div>

      {post.image && (
        <div className={styles.hero}>
          <img src={post.image} alt={`${post.title} illustration`} />
        </div>
      )}

      {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

      <dl className={styles.fields}>
        {config.detailFields.map((field) => {
          const rawValue = post.fields[field.key];
          let valueContent = rawValue || 'Not provided';

          if (field.key === 'image' && rawValue) {
            valueContent = (
              <a href={rawValue} target="_blank" rel="noopener noreferrer">
                View image
              </a>
            );
          }

          return (
            <div className={styles.field} key={field.key}>
              <dt className={styles.fieldLabel}>{field.label}</dt>
              <dd className={styles.fieldValue}>{valueContent}</dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}

