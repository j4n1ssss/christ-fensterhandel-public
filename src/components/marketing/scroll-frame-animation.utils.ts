/**
 * Mappt Scroll-Progress (0..1, wird geclampt) auf einen Frame-Index für eine
 * Sequenz mit `frameCount` Frames. Letzter Frame = frameCount - 1.
 */
export function progressToFrameIndex(
	progress: number,
	frameCount: number,
): number {
	if (frameCount <= 1) return 0;
	const clamped = Math.min(1, Math.max(0, progress));
	return Math.floor(clamped * (frameCount - 1));
}
