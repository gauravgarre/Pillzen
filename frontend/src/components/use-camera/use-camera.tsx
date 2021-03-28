import React, { Component } from "react";
import styles from "./use-camera.module.css";
import {
  Spinner,
  Text,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

interface Props {
  width: string;
  height: string;
  focusWidth: string;
  focusHeight: string;
  front: boolean;
  capture: any;
  ref: any;
  onError: (e: any) => any;
}

class Camera extends Component<Props> {
  constructor(props) {
    super(props);

    const { width, height, front } = this.props;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.camRef = React.createRef();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.canvasRef = React.createRef();

    this.state = {
      loading: true,
      error: false,
      errorMsg: "",
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          width: { ideal: width },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          height: { ideal: height },
          facingMode: front ? "user" : "environment",
        },
      })
      .then((stream) => {
        this.setState({ loading: false });
        this.success(stream);
      })
      .catch((e) => {
        this.setState({
          error: true,
          loading: false,
          errorMsg: `Error: '${e}'. Make sure you gave this application to use your camera.`,
        });
        this.error(e);
      });

    this.componentWillUnmount = function () {
      //stopping stream when the user leaves the camera
      if (this.camRef.current && this.camRef.current.srcObject) {
        this.camRef.current.srcObject
          .getVideoTracks()
          .forEach((track) => track.stop());
      }
    };
  }

  success = (stream) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const video = this.camRef.current;
    video.srcObject = stream;
    video.play();
  };

  error = (err) => {
    const { onError } = this.props;

    if (onError) {
      onError(err);
    } else {
      console.log(err);
    }
  };

  capture = (): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!this.state.error) {
      const { capture } = this.props;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const canvas = this.canvasRef.current;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const video = this.camRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0);
      capture(canvas.toDataURL("image/jpeg"));
    }
  };

  render() {
    const defaultColor = "#2acef5";
    const {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      showFocus,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      btnColor,
      width,
      height,
      focusWidth,
      focusHeight,
    } = this.props;

    return (
      <div className={styles.cameraContainer}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-expect-error */}
        {this.state.error ? (
          <Alert
            status="error"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            variant="solid"
            pt={12}
            pb={20}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Something went wrong
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-expect-error */}
              {this.state.errorMsg}
            </AlertDescription>
          </Alert>
        ) : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.state.loading ? (
          <>
            <Box mt={12} mb={20}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="red.500"
                size="xl"
              />
              <Text mt={2}>Turning on Camera</Text>
            </Box>
          </>
        ) : (
          <video
            id="video"
            width={width}
            height={height}
            autoPlay
            playsInline
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //   @ts-expect-error
            ref={this.camRef}
          />
        )}

        {showFocus ? (
          <div
            className="camera-focus"
            style={{
              borderColor: btnColor || defaultColor,
              width: focusWidth || "80%",
              height: focusHeight || "50%",
            }}
          />
        ) : null}
        <canvas
          id="canvas"
          width={width}
          height={height}
          //eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ref={this.canvasRef}
          style={{ display: "none" }}
        />
      </div>
    );
  }
}

export default Camera;
