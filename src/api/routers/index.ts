import usersRouter from './users';
import { router } from 'api/trpc';

const appRouter = router({
    users: usersRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;