import * as qs from "qs";
import { v4 as uuidv4 } from "uuid";

export class AuthLinkQueryParams {
  client_id?: string;
  redirect_uri?: string;
  state?: string;
  scope?: string;
}

export class OAuthLinkRes {
  url!: string;
}

export class GetTokenParams {
  client_id?: string;
  client_secret?: string;
  code!: string;
  redirect_uri!: string;
}

export class RefreshTokenParams {
  client_id!: string;
  client_secret?: string;
  refresh_token!: string;
}

export class TwitterAccountInfo {
  id!: string;
  name!: string;
  username!: string;
  profile_image_url?: string;
  created_at?: string;
}

export class TwitterAccessToken {
  access_token!: string;
  expires_in!: number;
  refresh_token!: string;
}

function generateSecureState(): string {
  const secureState = uuidv4(); // Generates a 128-bit (32-character) UUID
  return secureState;
}

// Store state in sessionStorage
function buildTwitterOAuthState(state?: string): string {
  const secureState = state || generateSecureState();
  sessionStorage.setItem(
    "twitter_oauthState",
    JSON.stringify({
      state: secureState,
      timestamp: Date.now(),
    })
  );
  return secureState;
}

function buildTwitterCodeChallenge(): string {
  const codeChallenge = uuidv4();
  sessionStorage.setItem(
    "twitter_oauthCodeChallenge",
    JSON.stringify({
      code_challenge: codeChallenge,
    })
  );
  return codeChallenge;
}

export function retrieveAndClearTwitterCodeChallenge(): string | null {
  const storedCodeChallenge = sessionStorage.getItem(
    "twitter_oauthCodeChallenge"
  );
  if (!storedCodeChallenge) return null;
  const parsedCodeChallenge = JSON.parse(storedCodeChallenge);
  sessionStorage.removeItem("twitter_oauthCodeChallenge");
  return parsedCodeChallenge.code_challenge;
}

// Verify state from sessionStorage
export function verifyAndClearState(state: string): boolean {
  const storedState = sessionStorage.getItem("twitter_oauthState");
  if (!storedState) return false;

  const parsedState = JSON.parse(storedState);

  // Optional: Add expiration check (e.g., 10 minutes)
  const isExpired = Date.now() - parsedState.timestamp > 10 * 60 * 1000;

  // Clear the state after verification
  sessionStorage.removeItem("twitter_oauthState");

  return parsedState.state === state && !isExpired;
}

export async function getOAuth2Link(
  params: AuthLinkQueryParams
): Promise<OAuthLinkRes> {
  const state = buildTwitterOAuthState(params.state);
  const scope = ["like.read", "tweet.read", "users.read"];
  const queryParams: Record<string, any> = {
    response_type: "code",
    client_id: params.client_id,
    redirect_uri: params.redirect_uri,
    scope: params.scope || scope.join("%20"),
    code_challenge: buildTwitterCodeChallenge(), //	A PKCE parameter, a random secret for each request you make.
    code_challenge_method: "plain",
    state, // A random string you provide to verify against CSRF attacks.
  };

  const url = `https://twitter.com/i/oauth2/authorize?${qs.stringify(
    queryParams,
    {
      encode: false,
    }
  )}`;
  return { url };
}

// export async function getOAuth2TokenImpl<TParams>(params: TParams) {
//   const response = await axios.post<
//     TwitterAccessToken,
//     AxiosResponse<TwitterAccessToken>,
//     TParams
//   >('https://api.twitter.com/2/oauth2/token', params);
//   return response.data;
// }

// export async function getOAuth2Token(params: GetTokenParams): Promise<TwitterAccessToken> {
//   return await getOAuth2TokenImpl({
//     grant_type: 'authorization_code',
//     code_verifier: 'challenge',
//     client_id: params.client_id || await getOAuth2ClientId('twitter'),
//     code: params.code,
//     redirect_uri: params.redirect_uri,
//   });
// }
