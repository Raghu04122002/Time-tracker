import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Dashboard from '@/components/Dashboard'

export default async function Page() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    // Strict Redirect: Managers should not see the employee dashboard
    if (session.role === 'MANAGER') {
        redirect('/manager')
    }

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Navbar user={session} />
            <main>
                <Dashboard />
            </main>
        </div>
    )
}
