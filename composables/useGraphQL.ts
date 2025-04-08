import { GraphQLClient, gql } from 'graphql-request'
import { useRuntimeConfig } from '#app'

export function useGraphQL() {
  const config = useRuntimeConfig()
  const client = new GraphQLClient(config.public.graphqlUrl)

  return {
    client,
    gql
  }
}