import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint(process.env.PRISMIC_API_ENDPOINT)

export function getPrismicClient(req?: unknown) {
  const client = prismic.createClient(
    endpoint
  )

  client.enableAutoPreviewsFromReq(req)

  return client;
}
