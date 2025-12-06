import { createUserWithTrial } from '@/lib/actions'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-red-500">TRUEXPANSE</h1>
        <a href="/login" className="text-white hover:underline">Already have an account? Sign in</a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Start Your Free Trial</h2>
          <p className="text-xl text-gray-400">Join thousands of sales teams crushing their goals</p>
        </div>

        <form action="/api/trial" method="POST" className="space-y-8 bg-zinc-900/50 p-10 rounded-2xl border border-zinc-800">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name *</label>
                <input name="company" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <input name="industry" className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input name="name" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Work Email *</label>
                <input name="email" type="email" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-lg transition">
            Start 7-Day Free Trial — No Card Required
          </button>
        </form>
      </main>
    </div>
  )
} final: correct 7-day trial homepage
