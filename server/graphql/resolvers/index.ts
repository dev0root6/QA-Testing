import { AuthenticationError, ForbiddenError } from 'apollo-server-micro';
import { getAppliedOnUSN, getSelectedByUSN } from '../../db';
import type { Context } from '../context';
import mutation from './mutation';
import query from './query';

type Resolver = (parent: any, args: any, ctx: Context, info: any) => any;
type Rule = 'public' | 'user' | 'admin' | 'self';

const requireUser = (ctx: Context) => {
    if (!ctx.USN || !ctx.role) throw new AuthenticationError('Please log in to continue.');
};

const isAdmin = (ctx: Context) => ctx.role === 'ADMIN';

/** USN that an operation targets, for "self" rules (admins may target anyone). */
const targetUSN = (args: any): string | undefined =>
    args?.USN ?? args?.input?.userID ?? args?.input?.USN;

const guard = (rule: Rule, fn: Resolver): Resolver => (parent, args, ctx, info) => {
    if (rule === 'public') return fn(parent, args, ctx, info);
    requireUser(ctx);
    if (rule === 'admin' && !isAdmin(ctx)) throw new ForbiddenError('Only administrators can do this.');
    if (rule === 'self' && !isAdmin(ctx) && targetUSN(args) !== ctx.USN) {
        throw new ForbiddenError('You can only access your own records.');
    }
    return fn(parent, args, ctx, info);
};

const queryRules: Record<string, Rule> = {
    users: 'admin',
    user: 'self',
    studentDetails: 'self',
    allStudentDetails: 'admin',
    companies: 'user',
    company: 'user',
    applied: 'user', // students only see their own (see below)
    selected: 'user',
    getSelectedByCompany: 'admin',
    studentCount: 'user',
    companyCount: 'user',
    appliedCount: 'user',
    selectedCount: 'user',
    eligibleCount: 'user',
    placedStudentCount: 'user',
    isStudentEligible: 'self',
    getAllEligibleStudentsForCompany: 'admin',
    hasStudentApplied: 'self',
    getUpcomingCompanies: 'user',
};

const mutationRules: Record<string, Rule> = {
    authenticate: 'public',
    createUser: 'admin',
    createCompany: 'admin',
    createApplied: 'self',
    createSelected: 'admin',
    updateUserDetails: 'user', // ownership is checked in the db layer
    updateCompany: 'admin',
    deleteUser: 'admin',
    deleteCompany: 'admin',
    deleteApplied: 'self',
    deleteSelected: 'admin',
    changePassword: 'user', // ownership is checked in the db layer
};

const applyRules = (resolvers: Record<string, Resolver>, rules: Record<string, Rule>) =>
    Object.fromEntries(
        Object.entries(resolvers).map(([name, fn]) => {
            const rule = rules[name];
            if (!rule) throw new Error(`No access rule defined for resolver "${name}"`);
            return [name, guard(rule, fn)];
        })
    );

const Query = applyRules(query as any, queryRules);

// Students see only their own applications / offers; admins see everything.
const allApplied = Query.applied;
const allSelected = Query.selected;
Query.applied = (p, a, ctx, i) => {
    requireUser(ctx);
    return isAdmin(ctx) ? allApplied(p, a, ctx, i) : getAppliedOnUSN(ctx.USN!);
};
Query.selected = (p, a, ctx, i) => {
    requireUser(ctx);
    return isAdmin(ctx) ? allSelected(p, a, ctx, i) : getSelectedByUSN(ctx.USN!);
};

const resolvers = {
    Query,
    Mutation: applyRules(mutation as any, mutationRules),
    // Lists of other students attached to a company are visible to admins only.
    Company: {
        applied: (parent: any, _: any, ctx: Context) => (isAdmin(ctx) ? parent.applied ?? [] : []),
        selected: (parent: any, _: any, ctx: Context) => (isAdmin(ctx) ? parent.selected ?? [] : []),
    },
};

export default resolvers;
