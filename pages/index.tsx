// pages/index.tsx
import Head from 'next/head';
import { useEffect, useState, FormEvent } from 'react'; // FormEventを追加するぜ！

// 記事のデータ構造を定義するインターフェースだ
interface Post {
  id: number;
  title: string;
  content: string;
  // created_atは今回は表示しないが、データとしては存在している
}

// Homeコンポーネントだぜ！これがブログのトップページになる
export default function Home() {
  // 状態管理のためのuseStateフックだ
  const [posts, setPosts] = useState<Post[]>([]); // 取得した記事を保持する
  const [error, setError] = useState<string | null>(null); // エラーメッセージを保持する
  const [newTitle, setNewTitle] = useState<string>(''); // 新しい記事のタイトル入力
  const [newContent, setNewContent] = useState<string>(''); // 新しい記事の内容入力

  // 記事データをバックエンドから取得する非同期関数だ
  // useEffectの中で呼び出すぜ！
  const fetchPosts = async () => {
    try {
      // Node.jsバックエンドのAPIを叩く！
      // ここで http://localhost:8080/api/posts にリクエストを送るんだ
      const response = await fetch('http://localhost:8080/api/posts');

      // HTTPステータスコードが200番台以外だったらエラーを投げる
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // レスポンスボディをJSONとしてパースする
      const data: Post[] = await response.json();
      setPosts(data); // 取得した記事をpostsステートにセット
      setError(null); // エラーをクリア
    } catch (e: any) {
      // エラーが起きたらエラーメッセージをセットしてコンソールにも出す
      setError(e.message);
      console.error("Failed to fetch posts:", e);
    }
  };

  // コンポーネントがマウントされた時に一度だけ記事を取得する
  useEffect(() => {
    fetchPosts();
  }, []); // 空の依存配列なので、初回レンダリング時のみ実行される

  // 新しい記事を投稿するフォームが送信された時に実行される関数だ
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // フォームのデフォルト送信動作（ページリロード）を防ぐ

    // タイトルか内容が空だったらエラーメッセージを表示して処理を中断
    if (!newTitle.trim() || !newContent.trim()) {
      setError('タイトルと内容を入力してください。');
      return;
    }

    try {
      // バックエンドの /api/posts エンドポイントにPOSTリクエストを送る
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST', // POSTメソッドを指定
        headers: {
          'Content-Type': 'application/json', // リクエストボディがJSON形式だと教える
        },
        body: JSON.stringify({ title: newTitle, content: newContent }), // JSオブジェクトをJSON文字列に変換して送る
      });

      // レスポンスがOKじゃなかったらエラーを投げる
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 入力フィールドをクリアする
      setNewTitle('');
      setNewContent('');
      fetchPosts(); // 投稿が成功したら、最新の記事リストを再取得して画面を更新
      setError(null); // エラーをクリア
    } catch (e: any) {
      setError(e.message);
      console.error('Failed to create post:', e);
    }
  };

  // ここからがJSX（見た目の部分）だぜ！
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Shunpy Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:rotate-3 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shunpy Blog</h1>

          {/* エラーメッセージを表示する部分だ */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">エラー:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* 記事投稿フォームだぜ！ */}
          <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">新しい記事を投稿</h2>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">タイトル:</label>
              <input
                type="text"
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="記事のタイトル"
                required // 必須項目にする
              />
            </div>
            <div className="mb-6">
              <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">内容:</label>
              <textarea
                id="content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="記事の内容をここに入力"
                required // 必須項目にする
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              投稿する
            </button>
          </form>

          {/* 記事一覧を表示する部分だ */}
          {posts.length === 0 && !error ? (
            <p className="text-gray-600 text-center">まだ記事がありません。</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 text-center">
            <a
              href="https://nextjs.org/docs"
              className="text-blue-600 hover:text-blue-800 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Docs &rarr;
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}