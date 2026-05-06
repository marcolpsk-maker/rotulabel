import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { saveProject, getUserProjects, deleteProject } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  projects: router({
    save: protectedProcedure
      .input(z.object({
        id: z.string().optional(),
        name: z.string(),
        data: z.string(),
        thumbnail: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await saveProject({
          id: (!input.id || input.id === 'new') ? `proj_${Date.now()}_${ctx.user.id}` : input.id,
          userId: ctx.user.id,
          name: input.name,
          data: input.data,
          thumbnail: input.thumbnail ?? null,
        });
        return { success: true, id: project.id };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserProjects(ctx.user.id);
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await deleteProject(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
