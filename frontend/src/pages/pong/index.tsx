import { Sidepanel } from "../../components";
import { useMeasure } from "react-use";
import React, { useEffect, useRef, useState } from "react";

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = window.innerWidth * 0.7;
  const canvasHeight = window.innerHeight * 0.7;

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="rounded-lg bg-secondary-800"
      />
    </div>
  );
};

export default function Pong() {
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  return (
    <div
      className="relative grid h-screen grid-cols-9 bg-secondary-700 lg:grid-cols-7"
      ref={ref}
    >
      <Sidepanel className=" col-span-2 lg:col-span-1" />
      <div className="col-span-7 flex items-center  justify-center lg:col-span-6">
        <PongGame />
      </div>
    </div>
  );
}
