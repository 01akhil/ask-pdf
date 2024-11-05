import { Button } from "@/components/ui/button";

import { UserButton,SignedIn,SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import {LogIn} from 'lucide-react'
import FileUpload from "@/components/ui/FileUpload";

export default async function Home() {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-t from-rose-100 to-teal-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center flex-col">
                <h1 className="mr-3 text-5xl font-semibold">
                  Chat with any PDF
                  <UserButton />
                </h1>

      <p className="max-w-xl mt-1 text-lg text-slate-600">
        Join millions of students, researchers to instantly answer questions and understand research with AI
      </p>

      <div className="w-full mt-4 ">
          <SignedIn>
            <FileUpload/>
          </SignedIn>

          <SignedOut>
           
            <Link href='/sign-in'>
            <Button>Login to get Started <LogIn/></Button>
            
            </Link>
          </SignedOut>
      </div>

              </div>
            </div>
        </div>
    </div>
  );
}

