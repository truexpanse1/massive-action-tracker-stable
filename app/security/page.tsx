export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Security & Privacy</h1>
      
      <div className="space-y-12 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4">100% Isolated Workspaces</h2>
          <p>Every company gets its own private workspace. We use PostgreSQL Row Level Security (RLS) so Company A can <strong>never</strong> see Company B’s KPIs — even with a stolen login or JWT.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Enterprise-Grade Infrastructure</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Database: Supabase (SOC 2, HIPAA-eligible, encrypted at rest & in transit)</li>
            <li>Hosting: Vercel (automatic HTTPS, global edge network)</li>
            <li>No third-party analytics that track your reps</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Data Stays Yours</h2>
          <p>We never sell, share, or mine your sales data. Period.</p>
        </section>

        <section className="text-center pt-8">
          <p className="text-sm text-gray-500">
            Questions? Email us anytime at support@apptruexpanse.com
          </p>
        </section>
      </div>
    </div>
  )
}
