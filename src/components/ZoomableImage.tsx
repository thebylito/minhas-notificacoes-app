import React, { useState, useRef } from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { ImageSourcePropType } from 'react-native';

interface ZoomableImageProps {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
  maxZoom?: number;
  minZoom?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
});

export default function ZoomableImage({
  source,
  width = screenWidth,
  height = screenHeight,
  maxZoom = 3,
  minZoom = 0.5,
}: ZoomableImageProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const translateXValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(0)).current;
  
  const [isZooming, setIsZooming] = useState(false);
  const [lastDistance, setLastDistance] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [baseScale, setBaseScale] = useState(1);
  const [basePanX, setBasePanX] = useState(0);
  const [basePanY, setBasePanY] = useState(0);

  const resetAnimation = () => {
    Animated.parallel([
      Animated.spring(scaleValue, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }),
      Animated.spring(translateXValue, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }),
      Animated.spring(translateYValue, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }),
    ]).start(() => {
      setBaseScale(1);
      setBasePanX(0);
      setBasePanY(0);
    });
  };

  const zoomToScale = (scale: number) => {
    Animated.parallel([
      Animated.spring(scaleValue, { 
        toValue: scale, 
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }),
      Animated.spring(translateXValue, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }),
      Animated.spring(translateYValue, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }),
    ]).start(() => {
      setBaseScale(scale);
      setBasePanX(0);
      setBasePanY(0);
    });
  };

  const handleDoubleTap = () => {
    const currentScale = (scaleValue as any)._value;
    if (currentScale > 1.5) {
      resetAnimation();
    } else {
      zoomToScale(2);
    }
  };

  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const [touch1, touch2] = touches;
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt) => {
      return evt.nativeEvent.touches.length >= 1;
    },
    onPanResponderGrant: (evt) => {
      if (evt.nativeEvent.touches.length === 1) {
        // Check for double tap
        const now = Date.now();
        if (now - lastTap < 300) {
          handleDoubleTap();
        }
        setLastTap(now);
        
        // Set base values for panning
        setBasePanX((translateXValue as any)._value);
        setBasePanY((translateYValue as any)._value);
      } else if (evt.nativeEvent.touches.length === 2) {
        // Start pinch gesture
        setIsZooming(true);
        const distance = getDistance(evt.nativeEvent.touches);
        setLastDistance(distance);
        setBaseScale((scaleValue as any)._value);
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (evt.nativeEvent.touches.length === 2 && isZooming) {
        // Handle pinch zoom
        const currentDistance = getDistance(evt.nativeEvent.touches);
        
        if (lastDistance > 0 && currentDistance > 0) {
          const scaleRatio = currentDistance / lastDistance;
          let newScale = baseScale * scaleRatio;
          
          // Constrain scale within limits
          newScale = Math.max(minZoom, Math.min(maxZoom, newScale));
          
          // Apply scale
          scaleValue.setValue(newScale);
        }
      } else if (evt.nativeEvent.touches.length === 1) {
        // Handle pan/drag
        const currentScale = (scaleValue as any)._value;
        
        if (currentScale > 1) {
          // Only allow panning when zoomed in
          const maxTranslateX = (width * (currentScale - 1)) / 2;
          const maxTranslateY = (height * (currentScale - 1)) / 2;
          
          const newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, basePanX + gestureState.dx));
          const newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, basePanY + gestureState.dy));
          
          translateXValue.setValue(newTranslateX);
          translateYValue.setValue(newTranslateY);
        }
      }
    },
    onPanResponderRelease: () => {
      setIsZooming(false);
      setLastDistance(0);
      
      // Reset if zoomed out too much
      const currentScale = (scaleValue as any)._value;
      if (currentScale < 1) {
        resetAnimation();
      } else {
        // Update base values for next gesture
        setBaseScale(currentScale);
        setBasePanX((translateXValue as any)._value);
        setBasePanY((translateYValue as any)._value);
      }
    },
    onPanResponderTerminate: () => {
      setIsZooming(false);
      setLastDistance(0);
    },
  });

  return (
    <View style={[styles.container, { width, height }]} {...panResponder.panHandlers}>
      <Animated.View style={{ width, height }}>
        <Animated.Image
          source={source}
          style={[
            styles.imageContainer,
            {
              transform: [
                { translateX: translateXValue },
                { translateY: translateYValue },
                { scale: scaleValue },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
