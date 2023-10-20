"use client";
import OSDViewer, {
  ScalebarLocation,
  ViewportProps,
  CanvasOverlayProps,
  OSDViewerRef,
} from "@lunit/osd-react-renderer";
import { useCallback, useRef, useState } from "react";

import {
  DEFAULT_CONTROLLER_MAX_ZOOM,
  DEFAULT_CONTROLLER_MIN_ZOOM,
  DEMO_MPP,
  MICRONS_PER_METER,
  TILED_IMAGE_SOURCE,
  VIEWER_OPTIONS,
} from "../../consts";
import OpenSeadragon from "openseadragon";
import { Viewport } from "next/dist/lib/metadata/types/extra-types";
import LeftBar from "../../components/LeftBar";

export default function TestPage() {
  let timer: ReturnType<typeof setTimeout>;

  const [viewportZoom, setViewportZoom] = useState<number>(1);
  const [refPoint, setRefPoint] = useState<OpenSeadragon.Point>();
  const [rotation, setRotation] = useState<number>(0);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [rectSize, setRectSize] = useState<[number, number]>([5000, 5000]);

  const canvasOverlayRef = useRef(null);
  const osdViewerRef = useRef<OSDViewerRef>(null);

  const refreshScaleFactor = useCallback(() => {
    const viewer = osdViewerRef.current?.viewer;
    if (!viewer) {
      return;
    }
    const imageWidth = viewer.world.getItemAt(0).getContentSize().x;
    const microscopeWidth1x = ((imageWidth * DEMO_MPP) / 25400) * 96 * 10;
    const viewportWidth = viewer.viewport.getContainerSize().x;
    setScaleFactor(microscopeWidth1x / viewportWidth);
  }, []);

  const handleViewportOpen = useCallback<
    NonNullable<ViewportProps["onOpen"]>
  >(() => {
    refreshScaleFactor();
  }, [refreshScaleFactor]);

  const handleViewportResize = useCallback<
    NonNullable<ViewportProps["onResize"]>
  >(() => {
    refreshScaleFactor();
  }, [refreshScaleFactor]);

  const handleViewportRotate = useCallback<
    NonNullable<ViewportProps["onRotate"]>
  >(
    ({
      eventSource: viewer,
      degrees,
    }: {
      eventSource: OpenSeadragon<Viewport>;
      degrees: number;
    }) => {
      if (viewer == null || degrees == null) {
        return;
      }
      refreshScaleFactor();
      setRotation(degrees);
    },
    [refreshScaleFactor]
  );

  const handleViewportZoom = useCallback<NonNullable<ViewportProps["onZoom"]>>(
    ({
      eventSource: viewer,
      zoom,
      refPoint,
    }: {
      eventSource: OpenSeadragon<Viewport>;
      zoom: number;
      refPoint: OpenSeadragon.Point;
    }) => {
      if (viewer == null || zoom == null) {
        return;
      }

      setViewportZoom(zoom);
      setRefPoint(refPoint || undefined);
    },
    []
  );

  const handleUpdatedCanvasOverlayRedraw = useCallback<
    NonNullable<CanvasOverlayProps["onRedraw"]>
  >(
    (canvas: HTMLCanvasElement, viewer: OpenSeadragon.Viewer) => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(50, 50, rectSize[0], rectSize[1]);
      }
      if (viewer.world && viewer.world.getItemAt(0)) {
        const imgSize = viewer.world.getItemAt(0).getContentSize();
        clearTimeout(timer);
        timer = setTimeout(() => {
          setRectSize([Math.random() * imgSize.x, Math.random() * imgSize.y]);
        }, 5000);
      }
    },
    [rectSize]
  );

  return (
    <main className="flex items-center h-screen">
      <LeftBar />
      <OSDViewer options={VIEWER_OPTIONS} ref={osdViewerRef}>
        <viewport
          zoom={viewportZoom}
          refPoint={refPoint}
          rotation={rotation}
          onOpen={handleViewportOpen}
          onResize={handleViewportResize}
          onRotate={handleViewportRotate}
          onZoom={handleViewportZoom}
          maxZoomLevel={DEFAULT_CONTROLLER_MAX_ZOOM * scaleFactor}
          minZoomLevel={DEFAULT_CONTROLLER_MIN_ZOOM * scaleFactor}
        />
        <tiledImage {...TILED_IMAGE_SOURCE} />
        <scalebar
          pixelsPerMeter={MICRONS_PER_METER / DEMO_MPP}
          xOffset={10}
          yOffset={30}
          barThickness={3}
          color="#443aff"
          fontColor="#53646d"
          backgroundColor={"rgba(255,255,255,0.5)"}
          location={ScalebarLocation.BOTTOM_RIGHT}
        />
        <canvasOverlay
          ref={canvasOverlayRef}
          onRedraw={handleUpdatedCanvasOverlayRedraw}
        />
      </OSDViewer>
    </main>
  );
}
