/**
 * /blog/* をBasic認証で保護する（テスト公開用）
 * パスワードは Cloudflare Pages の環境変数で設定する:
 *   BLOG_USER … ユーザー名
 *   BLOG_PASS … パスワード
 * 公開時はこのファイルを削除するだけでよい。
 */
export async function onRequest(context) {
  const { request, env, next } = context;

  const USER = env.BLOG_USER || "nearpro";
  const PASS = env.BLOG_PASS;

  // パスワード未設定なら閉じる（事故防止のため fail closed）
  if (!PASS) {
    return new Response("この領域は現在ご利用いただけません。", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const header = request.headers.get("Authorization") || "";
  if (header.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice(6));
    } catch (_) {
      decoded = "";
    }
    const i = decoded.indexOf(":");
    const user = i >= 0 ? decoded.slice(0, i) : "";
    const pass = i >= 0 ? decoded.slice(i + 1) : "";

    if (user === USER && pass === PASS) {
      const res = await next();
      const out = new Response(res.body, res);
      // 認証を通っても検索エンジンには絶対に載せない
      out.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return out;
    }
  }

  return new Response("認証が必要です。", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="NearPro Draft", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
