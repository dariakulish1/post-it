"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPost } from "@/app/lib/api";
import { supabase } from "@/app/lib/supabase";

const imageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "post-images";

type NewPostModalProps = {
    children?: React.ReactElement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const NewPostModal = ({ children, open, onOpenChange }: NewPostModalProps) => {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        const formData = new FormData(event.currentTarget);
        const title = String(formData.get('title') || '').trim();
        const anons = String(formData.get('anons') || '').trim();
        const fullText = String(formData.get('full_text') || '').trim();

        if (!title || !anons || !fullText) {
            setError('Title, summary, and content are required.');
            return;
        }

        setSubmitting(true);

        try {
            let imageUrl: string | undefined;
            let imagePath: string | undefined;

            if (image) {
                const extension = image.name.split('.').pop()?.toLowerCase() || 'jpg';
                imagePath = `posts/${crypto.randomUUID()}.${extension}`;
                const { error: uploadError } = await supabase.storage
                    .from(imageBucket)
                    .upload(imagePath, image, { contentType: image.type, upsert: false });

                if (uploadError) {
                    throw new Error(`Image upload failed: ${uploadError.message}`);
                }

                imageUrl = supabase.storage.from(imageBucket).getPublicUrl(imagePath).data.publicUrl;
            }

            await createPost({
                title,
                anons,
                full_text: fullText,
                image_url: imageUrl,
                image_path: imagePath,
            });

            formRef.current?.reset();
            setImage(null);
            onOpenChange?.(false);
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Failed to create post.');
        } finally {
            setSubmitting(false);
        }
    };

  return (
        <Dialog open={open} onOpenChange={onOpenChange}>
                {children && <DialogTrigger render={children} />}
        <DialogContent className="max-w-[425px] md:max-w-3xl">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
                <DialogDescription>
                    Fill in the details for your new post.
                </DialogDescription>
            </DialogHeader>
            <form ref={formRef} onSubmit={handleSubmit}>
                <div className="relative">
                    <p className="absolute top-5 left-4 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 bg-clip-text text-transparent">
                        Click to choose images for your post
                    </p>
                    <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="mb-4 text-transparent cursor-pointer border-2 border-dashed border-pink-200 rounded-md py-2 px-4 w-full h-20" /> 
                </div>
                <label htmlFor="title" className="mb-4">
                    Title
                </label>
                <input name="title" type="text" placeholder="Title" className="border border-gray-300 rounded-md py-2 px-4 mb-4 w-full" />
                <label htmlFor="anons" className="mb-4">
                    Anons
                </label>
                <input name="anons" type="text" placeholder="Anons" className="border border-gray-300 rounded-md py-2 px-4 mb-4 w-full" />
                <label htmlFor="content" className="mb-4">
                    Content
                </label>
                                <textarea name="full_text" placeholder="Content" className="border border-gray-300 rounded-md py-2 px-4 mb-4 w-full h-32"></textarea>
                                {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                                <button type="submit" disabled={submitting} className="bg-violet-500 text-white rounded-md font-medium hover:bg-violet-600 hover:shadow-md transition-all duration-300 ease-in-out py-3 px-4 disabled:cursor-not-allowed disabled:bg-gray-400">
                                    {submitting ? 'Creating...' : 'Create Post'}
                                </button>
            </form>
        </DialogContent>
        </Dialog>
    );
}