export const DEFAULT_CONTROLLER_MIN_ZOOM: number = 0.3125;
export const DEFAULT_CONTROLLER_MAX_ZOOM: number = 160;
export const DEMO_MPP = 0.263175;
export const MICRONS_PER_METER = 1e6;
export const RADIUS_UM = 281.34;
export const VIEWER_OPTIONS = {
  imageLoaderLimit: 8,
  smoothTileEdgesMinZoom: Infinity,
  showNavigator: true,
  showNavigationControl: false,
  timeout: 60000,
  navigatorAutoResize: false,
  preserveImageSizeOnResize: true,
  showRotationControl: true,
  zoomPerScroll: 1.3,
  animationTime: 0.3,
  gestureSettingsMouse: {
    clickToZoom: false,
    dblClickToZoom: false,
  },
  gestureSettingsTouch: {
    flickEnabled: false,
    clickToZoom: false,
    dblClickToZoom: false,
  },
};
export const WHEEL_BUTTON = 1;
