//@ts-ignore
import { VERCEL_GIT_COMMIT_SHA, VERCEL_ENV, VERCEL_BRANCH_URL } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		deploymentGitSHA: VERCEL_GIT_COMMIT_SHA,
        deploymentEnvironment: VERCEL_ENV,
	};
};