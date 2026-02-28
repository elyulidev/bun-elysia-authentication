import Elysia from "elysia";
import { signInRoute } from "./sign-in.route";
import { signUpRoute } from "./sign-up.route";
import { logoutRoute } from "./logout.route";

export const authRoutes = new Elysia().group("/auth", (group) =>
	group.use(signInRoute).use(signUpRoute).use(logoutRoute),
);
