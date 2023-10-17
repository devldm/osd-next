import Link from "next/link";

export default function LeftBar() {
  return (
    <div className="h-full w-[12%] bg-black absolute inset-y-0 left-0 z-20">
      <p className="text-white text-center text-xl font-bold my-4">
        lunit-osd-next
      </p>
      <ul className="z-50 flex flex-col w-full items-center text-xl text-white px-4 gap-4">
        <Link
          href={"#"}
          className="w-full text-center p-4 rounded-xl bg-green-600"
        >
          Test
        </Link>
        <Link
          href={"#"}
          className="w-full text-center p-4 rounded-xl bg-green-800"
        >
          WebGL
        </Link>
        <Link
          href={"#"}
          className="w-full text-center p-4 rounded-xl bg-green-800"
        >
          Other
        </Link>
        <Link
          href={"#"}
          className="w-full text-center p-4 rounded-xl bg-green-800"
        >
          Custom Image
        </Link>
      </ul>
      <div className="w-full bg-gray-600 h-[2px] my-6"></div>
      <p className="text-white text-center text-xl font-bold mb-4 uppercase">
        zoom
      </p>
      <ul className="z-50 flex flex-col w-full items-center text-xl text-white px-4 gap-4">
        <button className="bg-gray-600 w-full rounded-xl">MIN</button>
        <button className="bg-gray-300 text-black w-full rounded-xl">
          10x
        </button>
        <button className="bg-gray-600 w-full rounded-xl">20x</button>
        <button className="bg-gray-600 w-full rounded-xl">30x</button>
        <button className="bg-gray-600 w-full rounded-xl">40x</button>
        <button className="bg-gray-600 w-full rounded-xl">MAX</button>
      </ul>

      <div>
        <p className="">selected image</p>
      </div>
    </div>
  );
}