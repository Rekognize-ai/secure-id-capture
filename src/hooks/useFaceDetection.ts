import { useState, useEffect, useRef, useCallback } from 'react';

interface FacePosition {
  isDetected: boolean;
  isWellPositioned: boolean;
  isCentered: boolean;
  isSized: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled?: boolean;
  targetArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function useFaceDetection({ videoRef, enabled = true }: UseFaceDetectionOptions) {
  const [facePosition, setFacePosition] = useState<FacePosition>({
    isDetected: false,
    isWellPositioned: false,
    isCentered: false,
    isSized: false,
  });
  const [isSupported, setIsSupported] = useState(false);
  const detectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  // Check if FaceDetector API is available
  useEffect(() => {
    const checkSupport = async () => {
      if ('FaceDetector' in window) {
        try {
          // @ts-ignore - FaceDetector is experimental
          detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
          setIsSupported(true);
        } catch (e) {
          console.log('FaceDetector not supported:', e);
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);

  const detectFace = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !enabled) return;

    const video = videoRef.current;
    if (video.readyState !== 4 || video.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    try {
      const faces = await detectorRef.current.detect(video);
      
      if (faces.length > 0) {
        const face = faces[0];
        const { boundingBox } = face;
        
        // Calculate relative position
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        const faceCenterX = boundingBox.x + boundingBox.width / 2;
        const faceCenterY = boundingBox.y + boundingBox.height / 2;
        
        const videoCenterX = videoWidth / 2;
        const videoCenterY = videoHeight / 2;
        
        // Check if face is centered (within 20% of center)
        const centerToleranceX = videoWidth * 0.2;
        const centerToleranceY = videoHeight * 0.2;
        const isCentered = 
          Math.abs(faceCenterX - videoCenterX) < centerToleranceX &&
          Math.abs(faceCenterY - videoCenterY) < centerToleranceY;
        
        // Check if face is appropriately sized (between 20% and 60% of frame)
        const faceAreaRatio = (boundingBox.width * boundingBox.height) / (videoWidth * videoHeight);
        const isSized = faceAreaRatio > 0.08 && faceAreaRatio < 0.5;
        
        setFacePosition({
          isDetected: true,
          isWellPositioned: isCentered && isSized,
          isCentered,
          isSized,
          boundingBox: {
            x: boundingBox.x / videoWidth,
            y: boundingBox.y / videoHeight,
            width: boundingBox.width / videoWidth,
            height: boundingBox.height / videoHeight,
          },
        });
      } else {
        setFacePosition({
          isDetected: false,
          isWellPositioned: false,
          isCentered: false,
          isSized: false,
        });
      }
    } catch (e) {
      // Detection failed, continue
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  }, [videoRef, enabled]);

  useEffect(() => {
    if (isSupported && enabled) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSupported, enabled, detectFace]);

  return {
    facePosition,
    isSupported,
  };
}
