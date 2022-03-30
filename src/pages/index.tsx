import { GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import * as prismic from '@prismicio/client'
import { FiCalendar, FiUser } from 'react-icons/fi';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [pagination, setPagination] = useState(postsPagination);

  function loadMore() {
    fetch(pagination.next_page, {})
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        const newPagination: PostPagination = {
          next_page: result.next_page,
          results: [
            ...pagination.results,
            ...result.results,
          ],
        };
        setPagination(newPagination);
      })
      .catch((error) => {
        return console.log(error.message);
      });
    return;
  };


  return (
    <>
      <Head>
        Home | spacetraveling
      </Head>
      <Header />

      <main className={styles.container}>
        <div className={styles.posts}>
          {pagination.results.map((post) => {
            return (
              <li key={post.uid}>
                <Link href={`/post/${post.uid}`} >
                  <a>
                    <h2>{post.data.title}</h2>
                  </a>
                </Link>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <FiCalendar size='1rem' />
                    {format(
                      new Date(post.first_publication_date),
                      'PP',
                      { locale: ptBR },
                    )}
                  </span>
                  <span>
                    <FiUser size='1rem' />
                    {post.data.author}
                  </span>
                </div>
              </li>
            );
          })}
          {pagination.next_page && (
            <button
              onClick={() => loadMore()}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismicClient = getPrismicClient()

  const postsPagination = await prismicClient.get({
    predicates: prismic.predicate.at('document.type', 'posts'),
    pageSize: 1,
  })

  return {
    props: {
      postsPagination
    }
  }
};
