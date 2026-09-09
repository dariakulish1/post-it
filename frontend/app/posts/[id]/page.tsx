import { getPostById } from "@/app/lib/api";
import { Bookmark, User } from "lucide-react";
import Image from "next/image";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  const createdDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';

  return (
    <div className="flex flex-col items-center justify-center">
      {post.image_url ? (
        <div
          className="w-full flex items-center justify-center h-50 bg-cover bg-center relative overflow-hidden px-5"
          style={{ backgroundImage: `url("${post.image_url}")` }}
        >
          <h1 className="text-4xl font-bold text-white opacity-70 text-center sm:text-left mb-8 z-3">{post.title}</h1>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center h-50 bg-[url('/bg-image-posts.JPG')] bg-cover bg-center relative overflow-hidden px-5">
          <h1 className="text-4xl font-bold text-white opacity-70 text-center sm:text-left mb-8 z-3">{post.title}</h1>
        </div>
      )}
      <div className="flex flex-col items-center w-full pt-6 pb-5 max-w-4xl mx-auto">
            <div className="flex flex-col w-full items-start border-b border-gray-200 pb-4">
              <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
              <i className="opacity-70 text-lg text-center sm:text-left z-3">{post.anons}</i>
            </div>
          <div className="flex flex-row w-full justify-between items-center">
            <div className="flex flex-row w-full mt-3 mb-3 gap-4 items-center">
              <div className="flex items-center justify-center bg-gray-200 w-10 h-10 rounded-full">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex flex-col justify-left items-start text-left">
                <p className="text-center mt-2 text-gray-600">{post.author_name}</p>
                <p className="text-center mt-1 text-sm text-gray-500">{createdDate}</p>
              </div>
            </div>
            <div className="flex flex-row gap-4 items-center border border-gray-200 py-2 px-4 h-10 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200">
              <Bookmark className="w-6 h-6 text-gray-500" />
              <p>Save</p>
            </div>
          </div>
          <Image width={800} height={400} src={post.image_url} alt={post.title} className="w-full h-[400px] object-cover rounded-md mb-4 border-t border-gray-200 pt-4" />
          <div className="w-full">
            <p className="text-lg text-gray-700 mt-6">{post.full_text}</p>
          </div>
      </div>
    </div>
  );
}