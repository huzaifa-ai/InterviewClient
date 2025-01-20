'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                POIs Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
