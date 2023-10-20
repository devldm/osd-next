"use client";

import OSDViewer, {
  ScalebarLocation,
  ViewportProps,
  MouseTrackerProps,
  OSDViewerRef,
} from "@lunit/osd-react-renderer";
import { MouseEvent, useCallback, useRef, useState } from "react";

import {
  DEFAULT_CONTROLLER_MAX_ZOOM,
  DEFAULT_CONTROLLER_MIN_ZOOM,
  DEMO_MPP,
  MICRONS_PER_METER,
  TILED_IMAGE_SOURCE,
  VIEWER_OPTIONS,
  WHEEL_BUTTON,
} from "../../consts";
import OpenSeadragon from "openseadragon";
import { Viewport } from "next/dist/lib/metadata/types/extra-types";
import LeftBar from "../../components/LeftBar";
import useSVG from "@/app/hooks/useSVG";

export default function Svg() {
  const [viewportZoom, setViewportZoom] = useState<number>(1);
  const [refPoint, setRefPoint] = useState<OpenSeadragon.Point>();
  const [rotation, setRotation] = useState<number>(0);
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  const { setSVGSubVisibility, setSVGAllVisible } = useSVG();

  const osdViewerRef = useRef<OSDViewerRef>(null);
  const lastPoint = useRef<OpenSeadragon.Point | null>(null);
  const prevDelta = useRef<OpenSeadragon.Point | null>(null);
  const prevTime = useRef<number>(-1);

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

  const cancelPanning = useCallback(() => {
    lastPoint.current = null;
    prevDelta.current = null;
    prevTime.current = -1;
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

  const handleMouseTrackerLeave = useCallback<
    NonNullable<MouseTrackerProps["onLeave"]>
  >(() => {
    // temporary fix about malfunction(?) of mouseup and onNonPrimaryRelease event
    cancelPanning?.();
  }, [cancelPanning]);

  const handleMouseTrackerNonPrimaryPress = useCallback<
    NonNullable<MouseTrackerProps["onNonPrimaryPress"]>
  >((event: OpenSeadragon<MouseEvent>) => {
    if (event.button === WHEEL_BUTTON) {
      lastPoint.current = event.position?.clone() || null;
      prevDelta.current = new OpenSeadragon.Point(0, 0);
      prevTime.current = 0;
    }
  }, []);

  const handleMouseTrackerNonPrimaryRelease = useCallback<
    NonNullable<MouseTrackerProps["onNonPrimaryRelease"]>
  >(
    (event: OpenSeadragon<MouseEvent>) => {
      if (event.button === WHEEL_BUTTON) {
        cancelPanning();
      }
    },
    [cancelPanning]
  );

  const handleMouseTrackerMove = useCallback<
    NonNullable<MouseTrackerProps["onMove"]>
  >((event: OpenSeadragon<MouseEvent>) => {
    const viewer = osdViewerRef.current?.viewer;
    const throttle = 150;
    if (viewer && viewer.viewport) {
      if (lastPoint.current && event.position) {
        const deltaPixels = lastPoint.current.minus(event.position);
        const deltaPoints = viewer.viewport.deltaPointsFromPixels(deltaPixels);
        lastPoint.current = event.position.clone();
        if (!throttle || throttle < 0) {
          viewer.viewport.panBy(deltaPoints);
        } else if (prevDelta.current) {
          const newTimeDelta = Date.now() - prevTime.current;
          const newDelta = prevDelta.current.plus(deltaPoints);
          if (newTimeDelta > throttle) {
            viewer.viewport.panBy(newDelta);
            prevDelta.current = new OpenSeadragon.Point(0, 0);
            prevTime.current = 0;
          } else {
            prevDelta.current = newDelta;
            prevTime.current = newTimeDelta;
          }
        }
      }
    }
  }, []);

  const updateViewportZoom = (zoomValue: number) => {
    setViewportZoom(zoomValue);
  };
  return (
    <main className="flex items-center h-screen">
      <div className="absolute flex flex-col items-center justify-center z-50 inset-y-0 right-0 gap-2">
        <button onClick={setSVGAllVisible} className="font-bold">
          svg visible
        </button>
        <button
          onClick={() => setSVGSubVisibility(0)}
          className="py-1 px-3 bg-slate-500 rounded-lg"
        >
          svg sub 1
        </button>
        <button
          onClick={() => setSVGSubVisibility(1)}
          className="py-1 px-3 bg-slate-500 rounded-lg"
        >
          svg sub 2
        </button>
        <button
          onClick={() => setSVGSubVisibility(2)}
          className="py-1 px-3 bg-slate-500 rounded-lg"
        >
          svg sub 3
        </button>
      </div>
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
        <svgOverlay />
        <mouseTracker
          onLeave={handleMouseTrackerLeave}
          onNonPrimaryPress={handleMouseTrackerNonPrimaryPress}
          onNonPrimaryRelease={handleMouseTrackerNonPrimaryRelease}
          onMove={handleMouseTrackerMove}
        />
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
      </OSDViewer>
    </main>
  );
}
