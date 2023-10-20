"use client";

import OSDViewer, {
  ScalebarLocation,
  ViewportProps,
  OSDViewerRef,
} from "@lunit/osd-react-renderer";
import { useCallback, useRef, useState } from "react";

import {
  DEFAULT_CONTROLLER_MAX_ZOOM,
  DEFAULT_CONTROLLER_MIN_ZOOM,
  DEMO_MPP,
  MICRONS_PER_METER,
  VIEWER_OPTIONS,
  TILED_IMAGE_SOURCE,
} from "../../consts";
import OpenSeadragon from "openseadragon";
import { Viewport } from "next/dist/lib/metadata/types/extra-types";
import LeftBar from "../../components/LeftBar";
import useWebGL from "../../hooks/useWebGL";

export default function WebGL() {
  const [viewportZoom, setViewportZoom] = useState<number>(1);
  const [refPoint, setRefPoint] = useState<OpenSeadragon.Point>();
  const [rotation, setRotation] = useState<number>(0);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const webGLOverlayRef = useRef(null);
  const osdViewerRef = useRef<OSDViewerRef>(null);

  const { onWebGLOverlayRedraw, updateColors, clearColors } = useWebGL();

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

  const updateViewportZoom = (zoomValue: number) => {
    setViewportZoom(zoomValue);
  };

  return (
    <main className="flex items-center h-screen">
      <LeftBar
        viewportZoom={viewportZoom}
        updateViewportZoom={updateViewportZoom}
      />
      <OSDViewer
        options={VIEWER_OPTIONS}
        ref={osdViewerRef}
        className="h-[100%] z-1 flex-1"
      >
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
        <webGLOverlay ref={webGLOverlayRef} onRedraw={onWebGLOverlayRedraw} />
      </OSDViewer>
      <div className="flex flex-col gap-4">
        <button
          className="p-4 bg-red-600 rounded-lg text-black"
          onClick={() => {
            updateColors("#FF495C");
          }}
        >
          red
        </button>
        <button
          className="p-4 bg-green-600 text-black rounded-lg"
          onClick={() => {
            updateColors("#00BD9D");
          }}
        >
          green
        </button>
        <button
          className={`p-4 bg-blue-600 rounded-lg text-black`}
          onClick={() => {
            updateColors("#00000ff");
          }}
        >
          blue
        </button>
        <button
          className="p-4 bg-slate-800 rounded-lg text-white"
          onClick={() => {
            clearColors();
          }}
        >
          remove colors
        </button>
      </div>
    </main>
  );
}
