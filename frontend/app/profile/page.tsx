"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lottie } from "lottie-react";
import SavedPostsTab from "../components/SavedPostsTab/SavedPostsTab";
import { getCurrentUser, getMyPosts, deletePost } from "@/app/lib/api";
import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UserPost = {
  id: string;
  title: string;
  anons: string;
  image_url?: string;
  post_id: number;
};

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tabContent, setTabContent] = useState("your-posts");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchUserPosts = async () => {
      setPostsLoading(true);

      try {
        const posts = await getMyPosts();
        setUserPosts(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your posts.');
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?.id]);

  console.log(userPosts);

  const handleDelete = async (postId: string) => {
    setError('');
    setDeletingId(postId);

    try {
      await deletePost(postId);
      setUserPosts((posts) => posts.filter((post) => post.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center sm:items-start z-2">
      <div className="flex flex-col items-start justify-start w-full max-w-4xl mx-auto">
        <div className="flex flex-row gap-6 items-center justify-center">
          <Lottie className="w-30 h-30" src="/profileAnimation.json" autoplay loop />
          <h1 className="text-3xl font-bold">Profile Page</h1>
        </div>
        <div className="flex flex-col">
          <p className="mt-4 text-lg">
            Name: {loading ? "Loading..." : user?.name ?? "N/A"}
          </p>
          <p className="mt-2 text-lg">
            Email: {loading ? "Loading..." : user?.email ?? "N/A"}
          </p>
          <div className="pt-4">
            <Tabs defaultValue="overview">
              <TabsList variant="line">
                <TabsTrigger onClick={() => setTabContent("your-posts")} value="overview">Your Posts</TabsTrigger>
                <TabsTrigger onClick={() => setTabContent("saved-posts")} value="analytics">Saved Posts</TabsTrigger>
              </TabsList>
            </Tabs>
            {tabContent === "your-posts" && error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {tabContent === "your-posts" && (
              <div className="w-full flex flex-col py-10">
              <h1 className="text-4xl font-bold mb-6">Your Posts</h1>
              <div className="mt-2 grid grid-cols-3 gap-3">
              {postsLoading ? (
                <p className="text-gray-500">Loading your posts...</p>
              ) : userPosts.length === 0 ? (
                <p className="text-gray-500">You haven&apos;t created any posts yet.</p>
              ) : (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-3 hover:shadow-lg transition-shadow duration-300 "
                  >
                    {post.image_url ? (
                      <Image
                        width={400}
                        height={200}
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    ) : 
                    <div className="flex items-center justify-center w-full rounded-md h-48 relative bg-gradient-to-b from-gray-100 to-gray-300 overflow-hidden">
                      <ImageOff className="w-15 h-15 text-gray-500" />
                    </div>}
                    <div>
                      <p className="font-semibold">{post.title}</p>
                      <p className="text-sm text-gray-600">{post.anons}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === post.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))
              )}
            </div>
            </div>
            )}
            {
              tabContent === "saved-posts" && (
                <SavedPostsTab /> 
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;