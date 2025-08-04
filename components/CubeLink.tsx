'use client';

import React, { ReactNode, MouseEvent } from 'react';
import { useCubeNavigation } from './useCubeNavigation';

const loaders: Record<string, () => Promise<ReactNode>> = {
  '/test1': async () => {
    const { PageOneContent } = await import('@/components/test-pages/PageOne');
    return <PageOneContent />;
  },
  '/test2': async () => {
    const { PageTwoContent } = await import('@/components/test-pages/PageTwo');
    return <PageTwoContent />;
  },
  '/test3': async () => {
    const { PageThreeContent } = await import('@/components/test-pages/PageThree');
    return <PageThreeContent />;
  },
};

interface CubeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export default function CubeLink({ href, children, onClick, ...rest }: CubeLinkProps) {
  const navigate = useCubeNavigation();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    const load = loaders[href];
    void navigate(async () => {
      if (load) {
        return await load();
      }
    }).then(() => {
      window.history.pushState({}, '', href);
    });
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
