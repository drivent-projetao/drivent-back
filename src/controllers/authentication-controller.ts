import authenticationService, { SignInParams, AuthSignInParams } from "@/services/authentication-service";
import userService from "@/services/users-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function singInPost(req: Request, res: Response) {
  const { email, password } = req.body as SignInParams;

  try {
    const result = await authenticationService.signIn({ email, password });

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}
 
export async function authSingInPost(req: Request, res: Response) {
  const { email } = req.body as AuthSignInParams;

  try {
    await userService.createAuthUser({ email });
    const result = await authenticationService.authSignIn({ email });

    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}
