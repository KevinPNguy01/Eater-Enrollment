import { AntAlmanac, AntAlmanacUser } from 'types/AntAlmanac';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

const usersRouter = router({
    /**
     * Loads schedule data for a user that's logged in.
     */
    getUserData: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async () => {
            return {} as AntAlmanac | AntAlmanacUser;
        })
});

export default usersRouter;