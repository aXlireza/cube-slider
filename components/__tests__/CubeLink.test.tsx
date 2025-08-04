import React from "react";
import { fireEvent, render, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach, type Mock } from "vitest";
import CubeLink from "../CubeLink";
import { CubeContext } from "../CubeProvider";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
import { useRouter } from "next/navigation";
const useRouterMock = useRouter as unknown as Mock;

const navigateMock = vi.fn(async (loader: () => Promise<unknown>) => {
  await loader();
});
vi.mock("../useCubeNavigation", () => ({
  useCubeNavigation: () => navigateMock,
}));

// mock dynamic import target
vi.mock(
  "@/components/test-pages/PageOne",
  () => ({ PageOneContent: () => null }),
  { virtual: true },
);

describe("CubeLink", () => {
  beforeEach(() => {
    pushMock.mockReset();
    useRouterMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("preloads and navigates via next router on click", async () => {
    useRouterMock.mockReturnValue({ push: pushMock });
    const { getByText } = render(<CubeLink href="/test1">Go</CubeLink>);
    fireEvent.click(getByText("Go"));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/test1");
    });
  });

  it("uses cube context router when next router unavailable", async () => {
    useRouterMock.mockImplementation(() => {
      throw new Error("no router");
    });
    const ctx = {
      cubeRef: { current: null },
      zoomOut: 0,
      setZoomOut: () => {},
      zoomIn: 0,
      setZoomIn: () => {},
      speed: 1,
      setSpeed: () => {},
      position: [0, 0] as [number, number],
      setPosition: () => {},
      scale: 1,
      setScale: () => {},
      router: { push: pushMock },
    };
    const { getByText } = render(
      <CubeContext.Provider value={ctx}>
        <CubeLink href="/test1">Go</CubeLink>
      </CubeContext.Provider>,
    );
    fireEvent.click(getByText("Go"));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/test1");
    });
  });
});
