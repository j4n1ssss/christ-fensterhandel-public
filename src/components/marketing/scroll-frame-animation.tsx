"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { progressToFrameIndex } from "./scroll-frame-animation.utils";

export type ScrollFrameAnimationProps = {
	/** Pfad zum Ordner (relativ zu /public), z. B. "/assets/scroll-animations/01-messe-nuernberg-2026" */
	basePath: string;
	/** Dateinamens-Slug ohne Frame-Suffix, z. B. "targi-norymberga-zaproszenie-2026" */
	slug: string;
	/** Anzahl Frames. Default 30. */
	frameCount?: number;
	/** Poster-Extension für Frame 0. Default "jpg". */
	posterExt?: "jpg" | "png";
	/** Tailwind-Klassen für das äußere div. */
	className?: string;
	/** Nativ-ref auf Scroll-Track. Falls nicht gegeben, wird window-Scroll benutzt. */
	scrollTargetRef?: React.RefObject<HTMLElement | null>;
};

function framePath(
	basePath: string,
	slug: string,
	frame: number,
	ext: "webp" | "jpg" | "png",
) {
	const padded = frame.toString().padStart(5, "0");
	return `${basePath}/${slug}_${padded}.${ext}`;
}

export function ScrollFrameAnimation({
	basePath,
	slug,
	frameCount = 30,
	posterExt = "jpg",
	className,
	scrollTargetRef,
}: ScrollFrameAnimationProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imagesRef = useRef<HTMLImageElement[]>([]);
	const [isReady, setIsReady] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	const posterSrc = framePath(basePath, slug, 0, posterExt);

	// Reduced-motion
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mq.matches);
		const handler = (e: MediaQueryListEvent) =>
			setPrefersReducedMotion(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	// Preload all frames via IntersectionObserver (1000px rootMargin)
	useEffect(() => {
		if (prefersReducedMotion) return;
		const container = containerRef.current;
		if (!container) return;

		let cancelled = false;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries[0].isIntersecting) return;
				observer.disconnect();

				const urls = Array.from({ length: frameCount }, (_, i) =>
					framePath(basePath, slug, i, "webp"),
				);
				const images = urls.map((url) => {
					const img = new Image();
					img.src = url;
					return img;
				});
				imagesRef.current = images;

				Promise.all(
					images.map(
						(img) =>
							new Promise<void>((resolve) => {
								if (img.complete) resolve();
								else {
									img.onload = () => resolve();
									img.onerror = () => resolve();
								}
							}),
					),
				).then(() => {
					if (cancelled) return;
					setIsReady(true);
					drawFrame(0);
				});
			},
			{ rootMargin: "1000px 0px" },
		);

		observer.observe(container);
		return () => {
			cancelled = true;
			observer.disconnect();
		};
	}, [basePath, slug, frameCount, prefersReducedMotion]);

	const drawFrame = (index: number) => {
		const canvas = canvasRef.current;
		const img = imagesRef.current[index];
		if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;

		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Cover-Fit (füllt Canvas, beschneidet überstehenden Teil)
		const canvasAspect = rect.width / rect.height;
		const imgAspect = img.naturalWidth / img.naturalHeight;
		let dw = rect.width;
		let dh = rect.height;
		let dx = 0;
		let dy = 0;
		if (imgAspect > canvasAspect) {
			dw = rect.height * imgAspect;
			dx = (rect.width - dw) / 2;
		} else {
			dh = rect.width / imgAspect;
			dy = (rect.height - dh) / 2;
		}
		ctx.clearRect(0, 0, rect.width, rect.height);
		ctx.drawImage(img, dx, dy, dw, dh);
	};

	// Scroll-Progress -> Frame.
	// Animation läuft exakt während der Sticky-Phase:
	//   - Start: Section-Top trifft Viewport-Top (Section ist oben angedockt)
	//   - End:   Section-Bottom trifft Viewport-Bottom (Section beginnt rauszulaufen)
	const { scrollYProgress } = useScroll({
		target: scrollTargetRef,
		offset: ["start start", "end end"],
	});

	useMotionValueEvent(scrollYProgress, "change", (progress) => {
		if (prefersReducedMotion || !isReady) return;
		const idx = progressToFrameIndex(progress, frameCount);
		drawFrame(idx);
	});

	return (
		<div ref={containerRef} className={className}>
			{/* Poster als Initial-/Reduced-Motion-Layer */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={posterSrc}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			{!prefersReducedMotion && (
				<canvas
					ref={canvasRef}
					className="absolute inset-0 h-full w-full"
					aria-hidden="true"
				/>
			)}
		</div>
	);
}
