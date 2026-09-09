"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { addSavedPostId, isPostSaved, removeSavedPostId } from "@/app/lib/savedPosts";

export function SavePostButton({ postId }: { postId: string }) {
  const [saved, setSaved] = useState(() => isPostSaved(postId));

  const handleToggleSave = () => {
    if (saved) {
      removeSavedPostId(postId);
      setSaved(false);
    } else {
      addSavedPostId(postId);
      setSaved(true);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className="flex flex-row gap-4 items-center border border-gray-200 py-2 px-4 h-10 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200"
    >
      {saved ? <BookmarkCheck className="w-6 h-6 text-gray-700" /> : <Bookmark className="w-6 h-6 text-gray-500" />}
      <p>{saved ? 'Saved' : 'Save'}</p>
    </button>
  );
}
