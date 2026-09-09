"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPostById } from "@/app/lib/api";
import { getSavedPostIds } from "@/app/lib/savedPosts";

type SavedPost = {
  id: string;
  post_id: number;
  title: string;
  anons: string;
  image_url?: string;
};

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedPosts = async () => {
      const savedIds = getSavedPostIds();

      if (savedIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        savedIds.map((id) => getPostById(id).catch(() => null)),
      );

      setPosts(results.filter((post): post is SavedPost => post !== null));
      setLoading(false);
    };

    loadSavedPosts();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-start justify-center py-10">
      <h1 className="text-4xl font-bold mb-6">Saved Posts</h1>

      {loading ? (
        <p className="text-gray-500">Loading saved posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t saved any posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-full">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.post_id}`}
              className="border border-gray-200 rounded-md hover:shadow-md hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="w-full h-48 relative bg-gray-200 overflow-hidden rounded-t-md">
                {post.image_url && (
                  <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                )}
              </div>
              <div className="px-4 py-2 bg-white rounded-b-md">
                <h2 className="text-lg font-bold mb-2">{post.title}</h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.anons}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
