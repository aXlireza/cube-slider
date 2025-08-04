import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CubeLink from "../CubeLink";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

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
  it("preloads and navigates on click", async () => {
    const { getByText } = render(<CubeLink href="/test1">Go</CubeLink>);
    fireEvent.click(getByText("Go"));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/test1");
    });
  });
});
