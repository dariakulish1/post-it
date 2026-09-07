import { getPostById } from "@/app/lib/api";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

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
      <div className="flex flex-col items-center w-full px-10 py-6">
          <div className="flex flex-row justify-between items-center w-full gap-10">
            <div className="flex flex-col items-start ">
              <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
              <i className="opacity-70 text-center sm:text-left z-3">{post.anons}</i>
            </div>
            {/* {post.image_url && (
              <div>
                <Image src={post.image_url} width={600} height={400} alt={post.title} className="max-w-lg rounded-md" />
              </div>
            )} */}
          </div>
          <p className="text-lg text-gray-700 mt-6">{post.full_text}</p>
      </div>
    </div>
  );
}