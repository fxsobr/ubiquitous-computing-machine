import { GetStaticPaths, GetStaticProps } from 'next';

import * as prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { getPrismicClient } from '../../services/prismic';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <p>Carregando...</p>
    );
  };

  const timeReading = () => {
    const words = post.data.content.reduce((previous, current, index) => {
      const headingWords = current.heading.split(' ');
      let bodyWords = 0;
      current.body.forEach((body, index) => {
        const myBodyWords = body.text.split(' ');
        bodyWords += myBodyWords.length;
        return;
      });
      return previous += bodyWords;
    }, 0);
    const time = Math.ceil(words / 200);
    return time;
  };


  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt={post.data.banner.alt} className={styles.banner} />
      <main className={`${commonStyles.container} ${styles.container}`}>
        <h1>{post.data.title}</h1>
        <div>
          <span>
            <FiCalendar />
            {format(
              new Date(post.first_publication_date),
              'PP',
              { locale: ptBR },
            )}
          </span>
          <span>
            <FiUser />
            {post.data.author}
          </span>
          <span>
            <FiClock />
            {`${timeReading()} min`}
          </span>
        </div>
        <section />
        {post.data.content.map((content) => {
          return (
            <section key={content.heading}>
              <h2>{content.heading}</h2>
              {content.body.map((body) => {
                return (
                  <p key={body.text}>{body.text}</p>
                );
              })}
            </section>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismicClient = getPrismicClient()
  const { results } = await prismicClient.get({
    predicates: prismic.predicate.at('document.type', 'posts')
  });
  const paths = results.map((post) => {
    return { params: { slug: post.uid } };
  });
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const prismicClient = getPrismicClient();
  const slug = context.params.slug as string;
  const response = await prismicClient.getByUID('posts', String(slug), {});
  return {
    props: {
      post: response,
    },
  };
};