import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/sign-in");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="flex items-center space-x-4">
        {/* You can add logo or app name here */}
        <h1 className="text-xl font-bold">My App</h1>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Sign out
          </button>
        ) : (
          <>
            <a
              href="/api/auth/google"
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Sign in with Google
            </a>
            <a
              href="/api/auth/github"
              className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Sign in with GitHub
            </a>
          </>
        )}
      </div>
    </header>
  );
}