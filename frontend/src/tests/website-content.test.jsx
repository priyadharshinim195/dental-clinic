import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Gallery, Services, Testimonials } from "../site/Sections";
import { DEFAULT_CONTENT } from "../site/defaults";

describe("database-backed public content", () => {
  it("uses editable service titles and descriptions without changing card structure", () => {
    render(<Services content={{
      ...DEFAULT_CONTENT,
      "services.1.title": "Custom dental service",
      "services.1.text": "Updated service description.",
    }} />);

    expect(screen.getByRole("heading", { name: "Custom dental service" })).toBeInTheDocument();
    expect(screen.getByText("Updated service description.")).toBeInTheDocument();
    expect(document.querySelectorAll(".service-card")).toHaveLength(8);
  });

  it("renders managed gallery images and published testimonials", () => {
    render(
      <>
        <Gallery content={DEFAULT_CONTENT} images={[{ id: 8, url: "/media/room.jpg", alt: "Clinic room" }]} />
        <Testimonials content={DEFAULT_CONTENT} items={[{
          id: 4, display_name: "Anonymous patient", quote: "The team made me feel comfortable.",
        }]} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Clinic room" })).toHaveAttribute("src", "/media/room.jpg");
    expect(screen.getByText("Anonymous patient")).toBeInTheDocument();
    expect(screen.getByText("The team made me feel comfortable.")).toBeInTheDocument();
    expect(screen.queryByText("Placeholder · Not a patient review")).not.toBeInTheDocument();
  });
});
