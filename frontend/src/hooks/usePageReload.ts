import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface UsePageReloadOptions {
  force?: boolean;
  preserveScroll?: boolean;
}

export const usePageReload = () => {
  const router = useRouter();

  const reloadPage = useCallback((options: UsePageReloadOptions = {}) => {
    const { force = false, preserveScroll = false } = options;
    
    if (force) {
      // Force a hard reload of the page
      window.location.reload();
    } else {
      // Use Next.js router to refresh the page
      router.refresh();
      
      // If preserveScroll is false, scroll to top
      if (!preserveScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [router]);

  const reloadWithDelay = useCallback((delay: number = 1000, options: UsePageReloadOptions = {}) => {
    setTimeout(() => {
      reloadPage(options);
    }, delay);
  }, [reloadPage]);

  return {
    reloadPage,
    reloadWithDelay,
  };
};