import { VERCEL_GIT_COMMIT_REF, VERCEL_ENV, VERCEL_BRANCH_URL } from '$env/static/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		deploymentGitBranch: VERCEL_GIT_COMMIT_REF,
        deploymentEnvironment: VERCEL_ENV,
        deploymentUrl: VERCEL_BRANCH_URL
	};
};