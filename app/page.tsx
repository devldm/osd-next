"use client";

import OSDViewer, {
  ScalebarLocation,
  ViewportProps,
  TooltipOverlayProps,
  CanvasOverlayProps,
  MouseTrackerProps,
  OSDViewerRef,
} from "@lunit/osd-react-renderer";
import { MouseEvent, useCallback, useRef, useState } from "react";

import {
  DEFAULT_CONTROLLER_MAX_ZOOM,
  DEFAULT_CONTROLLER_MIN_ZOOM,
  DEMO_MPP,
  MICRONS_PER_METER,
  RADIUS_UM,
  TILED_IMAGE_SOURCE,
  VIEWER_OPTIONS,
  WHEEL_BUTTON,
} from "./consts";
import OpenSeadragon from "openseadragon";
import { Viewport } from "next/dist/lib/metadata/types/extra-types";
import LeftBar from "./components/LeftBar";

export default function Home() {
  const [viewportZoom, setViewportZoom] = useState<number>(1);
  const [refPoint, setRefPoint] = useState<OpenSeadragon.Point>();
  const [rotation, setRotation] = useState<number>(0);
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  const updateViewportZoom = (zoomValue: number) => {
    setViewportZoom(zoomValue);
  };

  const canvasOverlayRef = useRef(null);
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

  const onCanvasOverlayRedraw: NonNullable<CanvasOverlayProps["onRedraw"]> = (
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(50, 50, 5000, 5000);
    }
  };

  const onTooltipOverlayRedraw: NonNullable<
    TooltipOverlayProps["onRedraw"]
  > = ({ tooltipCoord, overlayCanvasEl, viewer }) => {
    const ctx = overlayCanvasEl.getContext("2d");
    if (ctx && tooltipCoord) {
      const radiusPx = RADIUS_UM / DEMO_MPP;
      const sizeRect = new OpenSeadragon.Rect(0, 0, 2, 2);
      const lineWidth = viewer.viewport.viewportToImageRectangle(
        viewer.viewport.viewerElementToViewportRectangle(sizeRect)
      ).width;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(tooltipCoord.x, tooltipCoord.y, radiusPx, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();
    }
  };

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
        <canvasOverlay
          ref={canvasOverlayRef}
          onRedraw={onCanvasOverlayRedraw}
        />
        <tooltipOverlay onRedraw={onTooltipOverlayRedraw} />
        <mouseTracker
          onLeave={handleMouseTrackerLeave}
          onNonPrimaryPress={handleMouseTrackerNonPrimaryPress}
          onNonPrimaryRelease={handleMouseTrackerNonPrimaryRelease}
          onMove={handleMouseTrackerMove}
        />
      </OSDViewer>
    </main>
  );
}
