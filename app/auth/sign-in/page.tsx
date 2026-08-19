import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <div className="space-y-4 w-full max-w-xs">
        <Link
          href="/api/auth/google"
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Sign in with Google
        </Link>
        <Link
          href="/api/auth/github"
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Sign in with GitHub
        </Link>
      </div>
    </div>
  );
}