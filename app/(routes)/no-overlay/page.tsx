"use client";

import OSDViewer, { OSDViewerRef } from "@lunit/osd-react-renderer";
import { TILED_IMAGE_SOURCE, VIEWER_OPTIONS } from "../../consts";
import { useRef } from "react";
import LeftBar from "../../components/LeftBar";

export default function NoOverlay() {
  const osdViewerRef = useRef<OSDViewerRef>(null);

  return (
    <main className="flex items-center h-screen">
      <LeftBar />
      <OSDViewer options={VIEWER_OPTIONS} ref={osdViewerRef}>
        <tiledImage {...TILED_IMAGE_SOURCE} />
      </OSDViewer>
    </main>
  );
}
