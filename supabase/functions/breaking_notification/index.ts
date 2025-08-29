import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9";

interface WebhookPayload {
	body: string;
	article_url: string;
	image?: string;
}


const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // change to your domain in prod
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", {
			headers: corsHeaders
		});
	}
	try {
		const authHeader = req.headers.get("Authorization");
		if (!authHeader) {
			return new Response("Unauthorized", { status: 401, headers: corsHeaders });
		}

		const supabaseClient = createClient(
			Deno.env.get("SUPABASE_URL")!,
			Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
			{
				global: {
					headers: { Authorization: req.headers.get("Authorization")! },
				},
			}
		);
		const token = req.headers.get("Authorization").replace("Bearer ", "");
		const {
			data: { user },
			error,
		} = await supabaseClient.auth.getUser(token);

		if (error || !user) {
			return new Response("Invalid token", { status: 401, headers: corsHeaders });
		}

		let payload: WebhookPayload | null = null;
		try {
			payload = await req.json();
		} catch {
			return new Response("Invalid or empty JSON body", { status: 400, headers: corsHeaders });
		}

		const { default: serviceAccount } = await import(
			"../service-account.json",
			{
				with: { type: "json" },
			}
		);

		const accessToken = await getAccessToken({
			clientEmail: serviceAccount.client_email,
			privateKey: serviceAccount.private_key,
		});

		const res = await fetch(
			`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					message: {
						topic: "breaking",
						notification: {
							title: `Breaking News`,
							body: payload.body,
							image: payload.image ?? "",
						},
						data: {
							url: payload.article_url,
						},
					},
				}),
			}
		);

		const resData = await res.json();
		if (res.status < 200 || 299 < res.status) {
			throw resData;
		}

		return new Response(JSON.stringify(resData), {
			headers: { "Content-Type": "application/json", ...corsHeaders },
		});
	} catch (error) {
		console.error("Error processing request:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: corsHeaders,
		});
	}
});

const getAccessToken = ({
	clientEmail,
	privateKey,
}: {
	clientEmail: string;
	privateKey: string;
}): Promise<string> => {
	return new Promise((resolve, reject) => {
		const jwtClient = new JWT({
			email: clientEmail,
			key: privateKey,
			scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
		});
		jwtClient.authorize((err, tokens) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(tokens!.access_token!);
		});
	});
};
