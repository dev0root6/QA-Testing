import { AuthenticationError } from 'apollo-server-micro';
import { prisma } from '../db';
import { verifyToken } from '../functions';

export interface Context {
    USN: string | null;
    role: 'ADMIN' | 'STUDENT' | null;
}

const context = async ({ req }: { req: any }): Promise<Context> => {
    const token = req.headers.authorization || '';
    const user = await verifyToken(token);

    if (!user) {
        return { USN: null, role: null };
    }

    const { USN, role, version } = user;
    const current = await prisma.user.findUnique({
        where: { USN },
        select: { version: true, role: true },
    });

    // Token is stale if the user was removed or their password changed.
    if (!current || current.version !== version) {
        throw new AuthenticationError('Session expired. Please log in again.');
    }

    return { USN, role: current.role };
};

export default context;
