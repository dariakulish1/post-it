"use client";

import { Lottie } from "lottie-react";
import { getCurrentUser } from "@/app/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full flex flex-col items-center justify-center sm:items-start z-2">
      <div className="flex flex-col items-start justify-start w-full max-w-4xl mx-auto">
        <div className="flex flex-row gap-6 items-center justify-center">
          <Lottie className="w-20 h-20" src="/profileAnimation.json" autoplay loop />
          <h1 className="text-3xl font-bold">Profile Page</h1>
        </div>
        <div className="flex flex-col">
          <p className="mt-4 text-lg">
            Name: {loading ? "Loading..." : user?.name ?? "N/A"}
          </p>
          <p className="mt-4 text-lg">
            Email: {loading ? "Loading..." : user?.email ?? "N/A"}
          </p>
          <div>
            <p>Your Posts</p>
            <div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;