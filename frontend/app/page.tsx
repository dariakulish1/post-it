import Image from "next/image";
import Link from "next/link";
import { getPosts, Post } from './lib/api';
import { Button } from "@/components/ui/button";
import { NewPostModal } from "./components/NewPostModal/NewPostModal";
import { ImageOff } from "lucide-react";

export default async function Home() {
  let posts: Post[] = [];
  try {
    const fetched = await getPosts();
    if (Array.isArray(fetched)) {
      posts = fetched;
    }
  } catch {
    posts = [];
  }
  const lastPosts = posts.slice(0, 3);
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans relative overflow-hidden">
        <div className="absolute top-[-180px] left-[-120px] rounded-full bg-[#7C3AED] opacity-35 blur-2xl z-0 w-[520px] h-[520px]"></div>
        <div className="absolute top-[-140px] right-[-80px] rounded-full bg-[#EC4899] opacity-35 blur-2xl z-0 w-[460px] h-[460px]"></div>
        <div className="absolute bottom-[-160px] left-[38%] rounded-full bg-[#0EA5E9] opacity-25 blur-3xl z-0 w-[460px] h-[460px]"></div>
      <main className="flex flex-1 w-full mx-auto max-w-8xl flex-col items-center justify-center py-5 px-10 sm:items-start z-2">
        <div className="flex flex-1 w-full max-w-4xl mx-auto flex-col items-center justify-center py-5 mt-0 md:mt-14 md:mb-10 px-10 sm:items-start z-2">
          <div className="flex flex-col items-center gap-5 sm:items-start">
            <h1 className="text-3xl lg:text-5xl font-bold text-center sm:text-left">Publish your ideas. Let people talk back.</h1>
            <p className="text-xl text-center sm:text-left text-gray-600">PostIT is a place to write, share, and get real replies — no algorithm deciding who sees it first.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 mt-5 mb-5">
            <NewPostModal>
              <Button className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300 hover:from-purple-700 hover:to-pink-600 px-6 py-6 text-md font-medium text-white">
                Start writing
              </Button>
            </NewPostModal>
            <Link href="/posts" className="rounded-lg bg-white border border-gray-300 px-6 py-3 text-md font-medium text-gray-800 hover:bg-gray-300">
              View posts
            </Link>
          </div>
        </div>
        <div className="flex flex-1 w-full max-w-8xl mx-auto flex-col items-center justify-center py-5 px-10 sm:items-start z-2">
          <h1 className="text-3xl lg:text-5xl font-bold text-center sm:text-left mt-10 mb-5">Recent posts</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-full">
              {lastPosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.post_id}`} className="border border-gray-200 rounded-md hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out bg-white">
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
    </div>
  );
}
