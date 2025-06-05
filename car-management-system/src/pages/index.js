import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const redirectUser = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          if (userData && userData.role) {
            if (userData.role === 'admin') {
              router.replace('/admin');
            } else if (userData.role === 'renter') {
              router.replace('/renter');
            } else {
              router.replace('/purchaser');
            }
          } else {
            router.replace('/purchaser');
          }
        } catch (error) {
          router.replace('/login');
        }
      } else {
        router.push('/login');
      }
    };

    redirectUser();

  }, [currentUser, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
