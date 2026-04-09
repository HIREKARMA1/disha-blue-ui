import { Navbar } from '@/components/ui/navbar'

export default function WhyPlatformPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="solid" />
            <div className="container mx-auto px-4 py-20 pt-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Why This Platform?
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Discover what makes this hyper-local opportunity platform a practical choice for job seekers and employers.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                            This page is coming soon. We are preparing a complete overview of how local opportunity discovery and regional hiring work across students, employers, and admins.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
