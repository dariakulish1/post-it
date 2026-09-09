'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NewPostModal } from "../NewPostModal/NewPostModal";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/app/lib/api";
import { User } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import LogoutModal from "../LogoutModal/LogoutModal";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch {
      // Keep the current UI state when the server cannot complete logout.
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 p-4 z-2">
        <div className="container mx-auto flex justify-between items-center">
            <div className="text-lg font-bold flex flex-row gap-2 items-center justify-center">
              <Image src="/postit-icon-1024.png" alt="PostIT Logo" width={32} height={32} className="border border-gray-300 rounded-md" />
              <span>PostIT</span>
            </div>
            <div className="space-x-4 flex flex-row w-full justify-between items-center">
                <div className="space-x-8 mx-auto flex items-center">
                  <Link href="/" className="font-semibold text-gray-600 hover:text-gray-900">Home</Link>
                  <Link href="/posts" className="font-semibold text-gray-600 hover:text-gray-900">Posts</Link>
                  {!loading && user && (
                    <>
                      <Link href="/profile" className="font-semibold text-gray-600 hover:text-gray-900">Profile</Link>
                    </>)}
                </div>
                {!loading && user && (
                  <>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" className="border-0" />}>
                      <div className="flex items-center space-x-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-md font-medium text-gray-600">{user.name}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                          <div className="inline-block w-full rounded-[6px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-[1px]">
                            <Button
                              type="button"
                              onClick={() => setNewPostOpen(true)}
                              className="border-0 rounded-[5px] py-2 px-4 text-gray-700 bg-white hover:bg-gray-100 w-full h-full"
                            >
                              Write
                            </Button>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <button type="button" onClick={() => setLogoutOpen(true)} className="w-full rounded-md py-2 px-4 text-gray-700 border border-gray-300 hover:bg-gray-100">
                            Log out
                          </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <NewPostModal open={newPostOpen} onOpenChange={setNewPostOpen} />
                  <LogoutModal open={logoutOpen} onOpenChange={setLogoutOpen} handleLogout={handleLogout} />
                  </>
                )}
                {!loading && !user && (
                  <>
                    <Link href="/signup" className="rounded-md py-2 px-4 text-white bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300 hover:from-purple-700 hover:to-pink-600">Sign up</Link>
                  </>
                )}
            </div>
        </div>
    </nav>
  );
}