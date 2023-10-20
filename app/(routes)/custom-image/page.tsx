"use client";

import OSDViewer, { OSDViewerRef } from "@lunit/osd-react-renderer";
import { useRef } from "react";

import { VIEWER_OPTIONS } from "../../consts";
import LeftBar from "../../components/LeftBar";

export default function CustomImage() {
  const osdViewerRef = useRef<OSDViewerRef>(null);

  return (
    <main className="flex items-center h-screen">
      <LeftBar />
      <OSDViewer options={VIEWER_OPTIONS} ref={osdViewerRef}>
        <tiledImage
          url="https://pdl1.api.dev.scope.lunit.io/slides/dzi/metadata?file=mrxs_test/SIZE_TEST_2.mrxs"
          tileUrlBase="https://pdl1.api.dev.scope.lunit.io/slides/images/dzi/mrxs_test/SIZE_TEST_2.mrxs"
        />
      </OSDViewer>
    </main>
  );
}
