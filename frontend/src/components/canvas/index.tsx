"use client"

import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../../context/game.context";
import { useMedia } from "react-use";
import { AppContext } from "../../context/app.context";
import { toast } from "react-toastify";

enum Keys {
    ArrowUp = "ArrowUp",
    ArrowDown = "ArrowDown",
    // ArrowLeft = "ArrowLeft",
    // ArrowRight = "ArrowRight",
    W = "w",
    S = "s",
    // Space = " ",
}

const Canvas = () => {
    const isMatch = useMedia("(max-width: 768px)");
    const canvasWidth = isMatch ? window.innerHeight * 0.6 : window.innerWidth * 0.6;
    const canvasHeight = isMatch ? window.innerWidth * 0.7 : window.innerHeight * 0.7;

    const widthScaleFactor = canvasWidth / 650
    const heightScaleFactor = canvasHeight / 480

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { socket, playerA, playerB, ball } = useContext(GameContext);
    const { user } = useContext(AppContext)

    useEffect(() => {

        const keyState: { [key: string]: boolean } = {};
        let key: string = ""; // Example: Use any key you want for touch events

        const handleTouchStart = (event: TouchEvent) => {
            // const touchY = event.touches[0].clientY;
            const touchX = event.touches[0].clientX;
            if (touchX > window.innerWidth / 2) {
                key = Keys.ArrowUp;
            }
            else {
                key = Keys.ArrowDown;
            }
            if (!keyState[key]) {
                keyState[key] = true;
                // Emit the event for key press
                socket?.emit("keyPressed", { key, userId: user?.id });
            }
        };

        const handleTouchEnd = (event: TouchEvent) => {
            // let key: string = "";
            // const touchX = event.touches[0].clientX;
            // if (touchX < canvasWidth / 2) {
            //     key = Keys.ArrowUp;
            // }
            // else {
            //     key = Keys.ArrowDown;
            // }
            if (keyState[key]) {
                keyState[key] = false;
                // Emit the event for key release
                socket?.emit("keyReleased", { key, userId: user?.id });
            }
        };

        document.addEventListener("touchstart", handleTouchStart, false);
        document.addEventListener("touchend", handleTouchEnd, false);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart, false);
            document.removeEventListener("touchend", handleTouchEnd, false);
        };
    }, [socket]);


    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (canvas && context) {

            const clearCanvas = () => {
                context.fillStyle = "#0F1019";
                context.fillRect(0, 0, canvas.width, canvas.height);

            };

            const drawRect = (
                x: number,
                y: number,
                w: number,
                h: number,
                r: number[] | number
            ) => {
                x *= widthScaleFactor;
                y *= heightScaleFactor;
                w *= widthScaleFactor;
                h *= heightScaleFactor;
                context.fillStyle = "#E5AC7C";
                context.beginPath();
                context.roundRect(x, y, w, h, r);
                context.closePath();
                context.fill();
                // context.drawImage(image, x, y, w, h);
            };

            const drawBall = (x: number, y: number, raduis: number) => {
                x *= widthScaleFactor;
                y *= heightScaleFactor;
                raduis *= Math.min(widthScaleFactor, heightScaleFactor);
                context.fillStyle = "white";
                context.beginPath();
                context.arc(x, y, raduis, 0, Math.PI * 2);
                context.closePath();
                context.fill();
            };

            const renderGame = () => {
                clearCanvas();
                for (let i = 0; i < 480;) {
                    drawRect(650 / 2 - 1, i, 2, 8, 5);
                    i += 12;
                }
                drawBall(ball.x, ball.y, ball.radius);
                drawRect(
                    playerA.x,
                    playerA.y,
                    playerA.width,
                    playerA.height,
                    [0, 5, 5, 0]
                );
                drawRect(
                    playerB.x,
                    playerB.y,
                    playerB.width,
                    playerB.height,
                    [5, 0, 0, 5]
                );
            };

            renderGame();
        }
    }, [playerA, playerB, ball, heightScaleFactor, widthScaleFactor]);

    useEffect(() => {
        if ('connection' in navigator) {
            const connection = navigator.connection as any;
            const intervalId = setInterval(() => {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    toast.warning('Your connection is slow. Try improving your connection for a better gaming experience.');
                }
            }, 20000)
            return () => {
                return clearInterval(intervalId);
            };
        }
    }, []);

    return (
        <canvas
            onContextMenu={(e) => e.preventDefault()}
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="rounded-lg bg-secondary-800 transform rotate-90 md:rotate-0"
        />
    )
}


export default Canvas;