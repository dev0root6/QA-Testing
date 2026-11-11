import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({ uri: process.env.NEXT_PUBLIC_API_URL || '/api/graphql' });
const authLink = setContext(async (_req, { headers }) => {
    let token;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;
