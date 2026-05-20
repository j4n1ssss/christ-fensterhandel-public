/**
 * @jest-environment node
 */
import { progressToFrameIndex } from "@/components/marketing/scroll-frame-animation.utils";

describe("progressToFrameIndex", () => {
  it("clampt Progress 0 auf Frame 0", () => {
    expect(progressToFrameIndex(0, 30)).toBe(0);
  });

  it("clampt Progress 1 auf letzten Frame (count-1)", () => {
    expect(progressToFrameIndex(1, 30)).toBe(29);
  });

  it("clampt Progress > 1 auf letzten Frame", () => {
    expect(progressToFrameIndex(1.5, 30)).toBe(29);
  });

  it("clampt Progress < 0 auf Frame 0", () => {
    expect(progressToFrameIndex(-0.3, 30)).toBe(0);
  });

  it("mappt 0.5 auf Mittel-Frame", () => {
    // bei 30 Frames: 0.5 * 29 = 14.5 -> floor = 14
    expect(progressToFrameIndex(0.5, 30)).toBe(14);
  });

  it("liefert immer Integer (floor)", () => {
    expect(progressToFrameIndex(0.333, 30)).toBe(Math.floor(0.333 * 29));
  });

  it("funktioniert mit frameCount = 1 (edge case)", () => {
    expect(progressToFrameIndex(0.5, 1)).toBe(0);
  });
});
