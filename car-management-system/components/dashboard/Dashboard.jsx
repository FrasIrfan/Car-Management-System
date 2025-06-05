import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { currentUser, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('[Dashboard] currentUser:', currentUser, 'loading:', loading);
    if (loading) return; // Wait for auth to resolve
    if (!currentUser) {
      console.log('[Dashboard] No currentUser, redirecting to /login');
      router.push('/login');
      return;
    }
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const data = userDoc.data();
        setUserData(data);
        console.log('[Dashboard] Fetched userData:', data);
        // Role-based redirect
        if (data && data.role) {
          if (data.role === 'admin') {
            router.replace('/admin');
            return;
          } else if (data.role === 'renter') {
            router.replace('/renter');
            return;
          } else if (data.role === 'purchaser') {
            router.replace('/purchaser');
            return;
          }
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching user data:', error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser, loading, router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('[Dashboard] Error signing out:', error);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Car Management System</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Car Management System</h1>
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">Welcome, {userData.email}</span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">User Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{userData.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}