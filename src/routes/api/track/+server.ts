import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export async function POST({ request, locals: { supabase } }) {
	const { url, userAgent, ip, commitSHA } = await request.json();
	const { error } = await supabase
		.from("page_views")
		.insert([{ url, user_agent: userAgent, user_ip: ip, git_commit_sha: commitSHA }]);
	if (error) {
		return json({ success: false, error: error.message }, { status: 500 });
	}

	return json({ success: true });
}
