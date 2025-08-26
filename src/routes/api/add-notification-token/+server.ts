import { json } from "@sveltejs/kit";

export async function POST({ request, url, locals: { supabase } }) {
	if (!url.searchParams.has("token")) {
		return json({ error: "Invalid token" }, { status: 403 });
	}
	const { error } = await supabase
		.from("notification_tokens")
		.insert([{ token: url.searchParams.get("token") }]);
	if (error) {
		console.log(error);
		return json({ success: false, error: error.message }, { status: 500 });
	}
	return json({ success: true });
}
