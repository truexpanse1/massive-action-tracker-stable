// app/page.tsx
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserWithTrial } from '@/lib/actions'; // we'll create this next

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-red-500">TRUE<span className="text-white">XPANSE</span></h1>
        <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
          Already have an account? Sign in
        </Button>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Start Your Free Trial</h2>
          <p className="text-xl text-gray-400">Join thousands of sales teams crushing their goals</p>
        </div>

        <form action={createUserWithTrial} className="space-y-8 bg-zinc-900/50 p-10 rounded-2xl border border-zinc-800">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Company Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input id="company" name="company" required className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="size">Company Size *</Label>
                <Select name="size" required>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1–10 employees</SelectItem>
                    <SelectItem value="11-50">11–50 employees</SelectItem>
                    <SelectItem value="51-200">51–200 employees</SelectItem>
                    <SelectItem value="201+">201+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select name="industry" required>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Company Phone *</Label>
                <Input id="phone" name="phone" type="tel" required className="bg-zinc-800 border-zinc-700" />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Your Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" required className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="role">Your Role *</Label>
                <Select name="role" required>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner / Founder</SelectItem>
                    <SelectItem value="sales-manager">Sales Manager / Owner</SelectItem>
                    <SelectItem value="rep">Sales Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" required className="bg-zinc-800 border-zinc-700" />
                <p className="text-sm text-gray-500 mt-1">Minimum 8 characters recommended</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 text-sm">
            Free 14-day trial includes full access to all features. No credit card required.
          </div>

          <Button type="submit" size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6">
            Start Free Trial
          </Button>
        </form>
      </main>
    </div>
  );
}
