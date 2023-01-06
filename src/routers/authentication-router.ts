import { singInPost, authSingInPost } from "@/controllers";
import { validateBody } from "@/middlewares";
import { signInSchema, authSignInSchema } from "@/schemas";
import { Router } from "express"; 

const authenticationRouter = Router();

authenticationRouter
  .post("/sign-in", validateBody(signInSchema), singInPost)
  .post("/auth-sign-in", validateBody(authSignInSchema), authSingInPost);

export { authenticationRouter };
