import { getPosts, Post } from '../lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

export default async function PostsPage() {
  let posts: Post[] = [];
  try {
    const fetched = await getPosts();
    if (Array.isArray(fetched)) {
      posts = fetched;
    }
  } catch {
    posts = [];
  }

  return (
    <main className="w-full flex flex-col items-center justify-center sm:items-start z-2">
      <div className="w-full flex items-center justify-center h-50 bg-[url('/bg-image-posts.JPG')] bg-cover bg-center relative overflow-hidden">
        <h1 className="text-6xl lg:text-8xl font-bold text-white opacity-70 text-center sm:text-left mb-8 z-3">Posts</h1>
      </div>
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-5 px-10 mt-7 sm:items-start">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.post_id}`} className="border border-gray-200 rounded-md hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out">
            {post.image_url ? (
              <div className="w-full h-48 relative bg-gray-200 overflow-hidden rounded-t-md">
                <Image width={500} height={300} src={post.image_url} alt={post.title} className="w-full h-full object-cover rounded-t-md" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full rounded-t-md h-48 relative bg-gradient-to-b from-gray-100 to-gray-300 overflow-hidden">
                <ImageOff className="w-15 h-15 text-gray-500" />
              </div>
            )}
            <div className="px-4 py-2 bg-white rounded-b-md">
              <h2 className="text-lg font-bold mb-2">{post.title}</h2>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.anons}</p>
            </div>
          </Link>
          ))}
        </div>
      </div>
    </main>
  );
}