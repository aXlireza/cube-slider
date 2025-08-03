'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';
import { useCubeNavigation } from './useCubeNavigation';

const loaders: Record<string, () => Promise<unknown>> = {
  '/test1': () => import('@/components/test-pages/PageOne'),
  '/test2': () => import('@/components/test-pages/PageTwo'),
  '/test3': () => import('@/components/test-pages/PageThree'),
};

interface CubeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: keyof typeof loaders;
  children: ReactNode;
}

export default function CubeLink({ href, children, onClick, ...rest }: CubeLinkProps) {
  const navigate = useCubeNavigation();
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    const load = loaders[href];
    void navigate(async () => {
      if (load) {
        await load();
      }
      router.push(href);
    });
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
