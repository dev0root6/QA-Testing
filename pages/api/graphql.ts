import { ApolloServer } from 'apollo-server-micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import context from '../../server/graphql/context';
import resolvers from '../../server/graphql/resolvers';
import typeDefs from '../../server/graphql/schema';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    introspection: process.env.NODE_ENV !== 'production',
    csrfPrevention: true,
    cache: 'bounded',
});

const startServer = server.start();

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.setHeader('Allow', 'GET, POST');
        res.status(405).end();
        return;
    }
    await startServer;
    await server.createHandler({ path: '/api/graphql' })(req, res);
}
