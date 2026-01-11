"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 mr-6 text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 font-bold">
            <Shield className="h-5 w-5" />
            <span>Nimbus Privacy Policy</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container py-8 max-w-4xl mx-auto">
        <ScrollArea className="h-[calc(100vh-8rem)] pr-6">
          <div className="space-y-8 pb-12">
            <section>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">1. Introduction</h2>
              <p className="leading-7">
                Welcome to Nimbus ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">2. The Data We Collect</h2>
              <p className="leading-7">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>
                  <span className="font-semibold">Identity Data:</span> includes name, username or similar identifier, and email address.
                </li>
                <li>
                  <span className="font-semibold">Technical Customer Service Data:</span> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.
                </li>
                <li>
                  <span className="font-semibold">Usage Data:</span> includes information about how you use our website, products and services (e.g., Code Playgrounds created, features used).
                </li>
              </ul>
              <div className="bg-secondary/50 p-4 rounded-md mt-4">
                <p className="text-sm font-medium">
                  Note on Telemetry: For security and account protection, we explicitly track your Login History, including IP address, Device Type, and Browser information upon each successful sign-in. This helps us detect unauthorized access to your account.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">3. How We Use Your Data</h2>
              <p className="leading-7">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>To register you as a new customer.</li>
                <li>To provide the Cloud IDE and Code Playground services.</li>
                <li>To manage our relationship with you.</li>
                <li>To Improve our website, products/services, marketing or customer relationships.</li>
                <li>To detect and prevent fraud or unauthorized access.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">4. Data Security</h2>
              <p className="leading-7">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">5. Your Legal Rights</h2>
              <p className="leading-7">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">6. Contact Us</h2>
              <p className="leading-7">
                If you have any questions about this privacy policy or our privacy practices, please contact us via the support channels on our website.
              </p>
            </section>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
