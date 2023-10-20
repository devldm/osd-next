import {
  DEFAULT_CONTROLLER_MAX_ZOOM,
  DEFAULT_CONTROLLER_MIN_ZOOM,
} from "./consts";

const ZOOM_LEVELS = [
  DEFAULT_CONTROLLER_MIN_ZOOM,
  0.5,
  1,
  2,
  5,
  10,
  20,
  40,
  DEFAULT_CONTROLLER_MAX_ZOOM,
];

export interface ZoomControllerProps {
  noSubdrawer?: boolean;
  zoom: number;
  minZoomLevel: number;
  maxZoomLevel: number;
  updateViewportZoom?: (newValue: number) => void;
}

const ZoomController = ({
  updateViewportZoom,
  noSubdrawer,
  zoom: zoomState,
  minZoomLevel,
}: // @todo maxZoomLevel을 구현할 것인지 검토(viewport host component와 스펙 통일)
ZoomControllerProps) => {
  return (
    <ul className="z-50 flex flex-col w-full items-center text-xl text-white px-4 gap-4">
      {ZOOM_LEVELS.map((zoomLevel) => {
        return (
          <button
            className="bg-gray-500 w-full rounded-lg"
            key={zoomLevel}
            onClick={(e) => {
              updateViewportZoom && updateViewportZoom(zoomLevel);
            }}
          >
            {zoomLevel.toString()}
          </button>
        );
      })}
    </ul>
  );
};

export default ZoomController;
