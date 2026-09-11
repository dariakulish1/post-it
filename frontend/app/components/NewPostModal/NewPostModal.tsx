"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPost } from "@/app/lib/api";
import { supabase } from "@/app/lib/supabase";
import { convertImageToWebp } from "@/app/lib/image";

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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imagePreviewRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (imagePreviewRef.current) {
                URL.revokeObjectURL(imagePreviewRef.current);
            }
        };
    }, []);

    const handleImageChange = (file: File | undefined) => {
        if (imagePreviewRef.current) {
            URL.revokeObjectURL(imagePreviewRef.current);
        }

        if (!file) {
            imagePreviewRef.current = null;
            setImagePreview(null);
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        imagePreviewRef.current = previewUrl;
        setImage(file);
        setImagePreview(previewUrl);
    };

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
                const webpImage = await convertImageToWebp(image);
                imagePath = `posts/${crypto.randomUUID()}.webp`;
                const { error: uploadError } = await supabase.storage
                    .from(imageBucket)
                    .upload(imagePath, webpImage, { contentType: 'image/webp', upsert: false });

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
            setImagePreview(null);
            onOpenChange?.(false);
            router.refresh();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Failed to create post.');
        } finally {
            setSubmitting(false);
        }
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
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
                    {!imagePreview && (
                        <p className="absolute top-5 left-4 text-xl cursor-pointer font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 bg-clip-text text-transparent z-1">
                        Click to choose images for your post
                    </p>)}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageChange(event.target.files?.[0])}
                        className={`mb-4 text-transparent cursor-pointer border-2 border-dashed border-pink-200 rounded-md py-2 px-4 ${!imagePreview ? 'w-full' : 'w-40'} h-20 z-10`}
                    />
                    {imagePreview && (
                        <div
                            role="button"
                            tabIndex={0}
                            aria-label="Change selected image"
                            onClick={openFilePicker}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    openFilePicker();
                                }
                            }}
                            className="absolute top-5 left-24 z-10 cursor-pointer rounded-md p-1 hover:bg-white/60"
                        >
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15L15.914 12C15.5377 11.5757 15.031 11.3394 14.5041 11.3424C13.9772 11.3454 13.4726 11.5875 13 12L6 21" stroke="#D7A3D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.7086 18.7425L13.0448 16.355L14.7983 14.0326" stroke="#D7A3D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 21.5L17.4984 20.8003C18.3983 20.6203 19.0868 19.8925 19.2166 18.9841C19.3765 17.8645 18.6475 16.8106 17.5435 16.5652L15 16" stroke="#D7A3D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" stroke="#D7A3D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}
                    {imagePreview && (
                        <Image
                            src={imagePreview}
                            alt="Selected image preview"
                            width={64}
                            height={64}
                            className="absolute top-2 left-2 h-16 w-16 rounded-md object-cover z-1"
                        />
                    )}
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