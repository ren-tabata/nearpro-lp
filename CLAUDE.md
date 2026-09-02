# NearPro（ニアプロ）サイト

現役プロゴルファー 小木野 太優 のゴルフ相談サービスのサイト。ビルド工程なしの静的HTML。

- 本番: https://nearpro.pages.dev （Cloudflare Pages・`main` へ push で自動デプロイ）
- CSS は全ページ共通の `styles.css` 1本。ページ個別のCSSは作らない
- ローカル確認: `python3 -m http.server 4599`

## コラム記事を追加するときの手順

**本番（main）に直接書かない。必ずブランチを切ってプレビューで確認してもらう。**

```bash
# ① 記事ごとにブランチを作る（post/<記事のスラッグ>）
git switch -c post/golf-slice

# ② 記事を作って push
git push -u origin post/golf-slice
```

→ 約20秒で **プレビューURL** が公開される：

```
https://post-golf-slice.nearpro.pages.dev
```

- ブランチ名の `/` や `_` はハイフンに変換される
- **Cloudflareが自動で `X-Robots-Tag: noindex` を付ける**ので検索には出ない（検証済み 2026-09-02）
- push し直せば同じURLが更新される。このURLを小木野さんに送って確認してもらう

```bash
# ③ OKが出たら本番へ
git switch main && git merge post/golf-slice && git push
git push origin --delete post/golf-slice   # ブランチは削除
```

### 公開時に必ずやること（1本目で漏れがあった項目）

- [ ] `blog/index.html` にカードを追加（既存の `<a class="post-card">`〜`</a>` を複製）。サムネは `assets/img/<slug>-card.jpg/.webp`（16:10・横760px）
- [ ] 記事ページに canonical / OGP / JSON-LD(BlogPosting) を入れる（`blog/golf-yips.html` をコピー元にする）
- [ ] OGP画像 `og-<slug>.jpg`（1200x630）を作る
- [ ] `sitemap.xml` に URL を追加
- [ ] Search Console で URL 検査 →「インデックス登録をリクエスト」＋ sitemap 再送信

## 記事の作り方（1本目で確立した型）

- 原稿は小木野さんから Pages ファイル(.pages)で届く。中身は IWA 形式なので snappy 展開してテキスト抽出する。原稿は `_原稿/`（gitignore）へ
- 原稿中の `<!-- IMAGE: 説明 / alt="..." -->` の位置に図解・写真を入れる
- 画像は WebP + JPG の2種を用意。図解は文字が読めるよう横1536px前後、写真は1200px前後
- 記事の装飾クラス:
  - `.keypoints` 冒頭の「この記事でわかること」
  - `.toc` 目次（h2 に `id="s1"`〜 を振る）
  - `.lead-line` 要点ブロック。**1,000字に1つが上限の目安**（原稿の段落まるごと強調を全部枠にすると緑だらけになる）
  - `.factor-grid` 箇条書きをカード化 / `h3.check` 番号バッジ付き見出し / `.refs` 参考文献
- 文字数: 1本目は看板記事として約10,000字。**2本目以降は3,000〜5,000字で十分**

## この案件でハマった落とし穴

- Cloudflare Pages は `/foo.html`→`/foo`、`/blog`→`/blog/` へ **308リダイレクト**する。内部リンク・canonical・sitemap は到達先URLに統一する
- `<img>` には必ず CSS で `height: auto` を当てる（HTMLのheight属性で縦横比が崩れた）
- Search Console 所有権確認の `<meta name="google-site-verification">` は全ページの head に常設。**削除禁止**
- in-app プレビューペインは `styles.css` を強くキャッシュする → `link.href='/styles.css?b='+Date.now()` で更新。またペイン内はスクロールが効かないので、長いページは headless Chrome + `body{margin-top:-Npx}` で切り出して確認する
- CSS を手編集したら波括弧の対応数を必ず確認する
- ボタンHTMLは全ページ完全同一にする（LINEアイコン入り）。`index.html` からコピーして使う
