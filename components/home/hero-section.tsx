import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Master Critical Conversations with AI-Powered Practice
            </h1>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Improve your management skills through realistic simulations of
              feedback sessions, performance reviews, and difficult
              conversations.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/simulator">
                <Button className="w-full min-[400px]:w-auto">
                  Try a Simulation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/create-scenario">
                <Button variant="outline" className="w-full min-[400px]:w-auto">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create Your Scenario
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[800px] aspect-video rounded-xl shadow-lg overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            >
              <source src="/assets/sped_up.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
