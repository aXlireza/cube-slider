"use client";

import React, { ReactNode, MouseEvent } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { useCubeNavigation } from "./useCubeNavigation";

const loaders: Record<string, () => Promise<ReactNode>> = {
  "/test1": async () => {
    const { PageOneContent } = await import("@/components/test-pages/PageOne");
    return <PageOneContent />;
  },
  "/test2": async () => {
    const { PageTwoContent } = await import("@/components/test-pages/PageTwo");
    return <PageTwoContent />;
  },
  "/test3": async () => {
    const { PageThreeContent } = await import(
      "@/components/test-pages/PageThree",
    );
    return <PageThreeContent />;
  },
};

interface CubeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

function useOptionalRouter() {
  try {
    return useNextRouter();
  } catch {
    return null;
  }
}

export default function CubeLink({
  href,
  children,
  onClick,
  ...rest
}: CubeLinkProps) {
  const navigate = useCubeNavigation();
  const router = useOptionalRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    const load = loaders[href];
    void navigate(async () => {
      if (load) {
        return await load();
      }
    }).then(() => {
      if (router) {
        router.push(href);
      } else {
        window.history.pushState({}, "", href);
      }
    });
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
