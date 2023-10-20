import Link from "next/link";
import { usePathname } from "next/navigation";
import ZoomController from "../ZoomController";
import {
  DEFAULT_CONTROLLER_MAX_ZOOM,
  DEFAULT_CONTROLLER_MIN_ZOOM,
} from "../consts";
interface link {
  linkText: string;
  href: string;
}

const pages: link[] = [
  { linkText: "Home", href: "/" },
  { linkText: "WebGL", href: "/webgl" },
  { linkText: "Custom Image", href: "/custom-image" },
  { linkText: "No overlay", href: "/no-overlay" },
  { linkText: "Test page", href: "/test-page" },
  { linkText: "svg", href: "/svg" },
];

export default function LeftBar({
  viewportZoom,
  updateViewportZoom,
}: {
  viewportZoom?: number;
  updateViewportZoom?: (newValue: number) => void;
}) {
  const pathname = usePathname();

  return (
    <div className="h-full w-[12%] bg-[#121212] absolute inset-y-0 left-0 z-20">
      <p className="text-white text-center text-xl font-bold my-4">
        lunit-osd-next
      </p>
      <ul className="z-50 flex flex-col w-full items-center text-xl text-white px-4 gap-4">
        {pages.map((page) => {
          return (
            <Link
              key={page.linkText}
              href={page.href}
              className={`w-full text-center p-4 rounded-xl bg-green-600 ${
                pathname === page.href ? "bg-green-800 " : ""
              }`}
            >
              {page.linkText}
            </Link>
          );
        })}
      </ul>
      <div className="w-full bg-gray-600 h-[2px] my-6"></div>
      {viewportZoom ? (
        <>
          <p className="text-white text-center text-xl font-bold mb-4 uppercase">
            zoom
          </p>

          <ZoomController
            zoom={viewportZoom}
            minZoomLevel={DEFAULT_CONTROLLER_MIN_ZOOM}
            maxZoomLevel={DEFAULT_CONTROLLER_MAX_ZOOM}
            updateViewportZoom={updateViewportZoom}
          />
        </>
      ) : null}

      {/* <div>
        <p className="">selected image</p>
      </div> */}
    </div>
  );
}
