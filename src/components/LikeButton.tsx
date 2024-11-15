import React from 'react';
import { Heart } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface LikeButtonProps {
  userId: string;
  currentUserId: string | null;
  isLiked: boolean;
  likesCount: number;
  onLikeToggle: (newLikeState: boolean) => void;
}

export function LikeButton({ userId, currentUserId, isLiked, likesCount, onLikeToggle }: LikeButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLike = async () => {
    if (!currentUserId || isLoading) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const currentUserRef = doc(db, 'users', currentUserId);

      // Always add like (clicker style)
      await updateDoc(userRef, {
        likedBy: arrayUnion(currentUserId)
      });
      await updateDoc(currentUserRef, {
        likes: arrayUnion(userId)
      });
      onLikeToggle(true);

      // Show animation
      const element = document.getElementById(`like-button-${userId}`);
      if (element) {
        element.classList.add('scale-125');
        setTimeout(() => {
          element.classList.remove('scale-125');
        }, 200);
      }
    } catch (error) {
      console.error('Error adding like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      id={`like-button-${userId}`}
      onClick={handleLike}
      disabled={!currentUserId || isLoading}
      className="flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 text-red-500 hover:text-red-600"
    >
      <Heart className="w-4 h-4 transition-transform fill-current" />
      <span className="text-sm">{likesCount}</span>
    </button>
  );
}