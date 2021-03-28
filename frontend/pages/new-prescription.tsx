import React, {
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Heading,
  Button,
  Box,
  Grid,
  GridItem,
  Text,
  Image,
  useToast,
  Stack,
  Input,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogHeader,
  useDisclosure,
} from "@chakra-ui/react";
import Head from "next/head";
import { useDropzone } from "react-dropzone";
import { FaFileImport } from "react-icons/fa";
import Camera from "../src/components/use-camera/use-camera";
import { AiOutlineCamera } from "react-icons/ai";
import { AuthContext } from "../src/auth/main-auth-functionality";
import { useRouter } from "next/router";
import axios from "axios";
import * as firebase from "firebase/app";
import "firebase/auth";
import DashboardDrawer from "../src/components/drawer/drawer";
import "@firebase/storage";

const storage = firebase.default.storage();

const Home: React.FC = () => {
  const { user, runningAuth } = useContext(AuthContext);
  const [selectedImgURL, setSelectedImgURL] = useState<string>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState("sms");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");

  const toast = useToast();

  const cam = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const handleNotificationChange = (e) => {
    setNotificationMethod(e.target.value);
  };

  useEffect(() => {
    //if the auth check if complete and the user is not logged-in, sending him to the join/login page
    if (!user && !runningAuth) {
      router.push("/login");
    }
    // else if (user && !runningAuth) {
    //   firebase.default
    //     .auth()
    //     .currentUser.getIdToken(/* forceRefresh */ true)
    //     .then((idToken: string) => {
    //       axios
    //         .get(
    //           "/api/get-user-data",

    //           {
    //             headers: {
    //               token: idToken,
    //             },
    //           }
    //         )
    //         .then((res) => {
    //           const { phoneNumber, name } = res.data;

    //           setPhoneNumber(phoneNumber);
    //           setUserName(name);
    //         })
    //         .catch((e) => {
    //           console.error(e);
    //           toast({
    //             title: "Something Went Wrong",
    //             description:
    //               "This issue is from us. We appreciate your patience ",
    //             status: "error",
    //             duration: 9000,
    //             isClosable: true,
    //             position: "bottom-right",
    //           });
    //         });
    //     })
    //     .catch((e) => {
    //       console.error(e);
    //       toast({
    //         title: "Something Went Wrong",
    //         description: "Make Sure You're Signed in Properly",
    //         status: "error",
    //         duration: 9000,
    //         isClosable: true,
    //         position: "bottom-right",
    //       });
    //     });
    // }
  }, [user, runningAuth]);

  const handleNameChange = (e: any) => {
    setUserName(e.target.value);
  };

  const handlePhoneNumChange = (e: any) => {
    setPhoneNumber(e.target.value);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedImgURL(URL.createObjectURL(acceptedFiles[0]));
  }, []);

  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5242880, //5mb
    accept: "image/*",
  });

  const handleCamError = (): void => {
    toast({
      title: "Something went wrong",
      description: "Something went wrong while capturing image",
      status: "error",
      duration: 9000,
      isClosable: true,
    });
  };

  function captureImage(imgSrc: string) {
    setSelectedImgURL(imgSrc);
    setOpenCamera(false);
  }

  const handleCloseCamera = (): void => {
    setOpenCamera(false);
  };
  const handleOpenCamera = (): void => {
    setOpenCamera(true);
  };

  const handleSubmit = (): void => {
    if (selectedImgURL && notificationMethod && phoneNumber && userName) {
      toast({
        title: "Processing",
        description: "Wait a while ....",
        status: "info",
        duration: 9000,
        isClosable: true,
        position: "bottom-right",
      });
      fetch(selectedImgURL)
        .then((res) => res.blob())
        .then((blob) => {
          const imgFileData = new File([blob], `${new Date().getTime()}`, {
            type: "image/jpg",
          });

          const storageRef = storage.ref(
            `/UsersUploadedFiles/${user.uid}/${imgFileData.name}`
          );
          storageRef.put(imgFileData).then(() => {
            storageRef.getDownloadURL().then((imgDownloadURL) => {
              axios
                .post("https://3a4687ce719c.ngrok.io/detect_text", {
                  imgDownloadURL,
                  phoneNumber,
                  userName,
                  notificationMethod,
                })
                .then((res) => {
                  console.log(res);
                  onOpen(); //opening the success model
                })
                .catch((e) => {
                  console.error(e);
                  toast({
                    title: "Something went wrong",
                    description:
                      "The problem is on our side, we appreciate your patience.",
                    status: "warning",
                    duration: 9000,
                    isClosable: true,
                    position: "bottom-right",
                  });
                });
            });
          });
        });
    } else {
      toast({
        title: "Information Missing",
        description:
          "Make sure all four of these information are filled: Prescription Image, Name, Notification Method and Phone Number",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  return (
    <>
      <Head>
        <title>New Prescription | Pillzen</title>
      </Head>

      <Box pr={10} pl={10} mb={20}>
        <Heading display="table" m="0 auto" mb="100px">
          Add New Prescription
        </Heading>
        <Grid templateColumns="repeat(6, 1fr)" gap={4}>
          <GridItem colSpan={3}>
            <Heading>Prescription Image</Heading>
            <Grid mt="70px" templateColumns="repeat(6, 1fr)" gap={4}>
              <GridItem m="0 auto" colSpan={3}>
                <Box>
                  <Heading size="md" mb="30px">
                    Upload Image
                  </Heading>
                  <Box
                    {...getRootProps()}
                    height="200px"
                    border="1px dashed"
                    textAlign="center"
                    cursor="pointer"
                    pr={2}
                    pl={2}
                  >
                    <input {...getInputProps()} />
                    <Box pos="relative" top="15%">
                      <FaFileImport
                        style={{
                          width: "55px",
                          height: "55px",
                          margin: "0 auto",
                        }}
                      />
                      <Text marginTop="20px">
                        Click or drag file to this area to upload
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </GridItem>
              <GridItem m="0 auto" colSpan={3} w="100%">
                <Heading size="md" mb="30px">
                  Capture Image
                </Heading>

                <Box>
                  {openCamera ? (
                    <Box textAlign="center">
                      <Camera
                        front={false}
                        capture={captureImage}
                        ref={cam}
                        width="100%"
                        height="100%"
                        focusWidth="100%"
                        focusHeight="100%"
                        onError={handleCamError}
                      />
                      <Button
                        colorScheme="facebook"
                        mt={5}
                        size="sm"
                        // https://stackoverflow.com/questions/37949981/call-child-method-from-parent
                        onClick={(img) => cam.current.capture(img)}
                      >
                        Take Image
                      </Button>
                      <Button
                        display="block"
                        size="sm"
                        variant="ghost"
                        // https://stackoverflow.com/questions/37949981/call-child-method-from-parent
                        onClick={handleCloseCamera}
                        m="0 auto"
                        mt={5}
                      >
                        close camera
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      leftIcon={<AiOutlineCamera />}
                      variant="outline"
                      size="sm"
                      onClick={handleOpenCamera}
                    >
                      Open Camera
                    </Button>
                  )}
                </Box>
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem w="100%" m="0 auto" colSpan={3}>
            <Heading mb="30px">Preview</Heading>
            {selectedImgURL && selectedImgURL.length ? (
              <Box>
                <Image w="80%" src={selectedImgURL} alt="Uploaded Image" />
              </Box>
            ) : null}
          </GridItem>
        </Grid>

        <Grid mt={"100px"} templateColumns="repeat(6, 1fr)" gap={4}>
          <GridItem colSpan={3}>
            <Heading mb="30px">Info</Heading>

            <Stack spacing={10}>
              <Stack spacing={5}>
                <Heading size="sm">
                  Name <span style={{ color: "red" }}>*</span>
                </Heading>
                <Input
                  value={userName}
                  onChange={handleNameChange}
                  variant="filled"
                  placeholder="Your Name"
                />
              </Stack>
              <Stack spacing={5}>
                <Heading size="sm">
                  Phone Number <span style={{ color: "red" }}>*</span>
                </Heading>
                <Input
                  variant="filled"
                  placeholder="Phone Number to Receive Notifications"
                  value={phoneNumber}
                  onChange={handlePhoneNumChange}
                />
              </Stack>
              <Stack spacing={5}>
                <Heading size="sm">
                  {" "}
                  Notification Method <span style={{ color: "red" }}>*</span>
                </Heading>
                <Select
                  value={notificationMethod}
                  onChange={handleNotificationChange}
                  variant="filled"
                  w="80%"
                  placeholder="Select Method"
                >
                  <option value="sms">Via SMS</option>
                  <option value="phoneCall">Via Phone Call</option>
                  <option value="both">Via SMS and Phone Call Both</option>
                </Select>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem colSpan={3}>
            <Button
              pr="60px"
              pl="60px"
              size="lg"
              bg="rgba(16, 181, 60, 0.7)"
              display="table"
              m="100px auto"
              _hover={{
                background: "rgba(16, 181, 60, 0.9)",
              }}
              onClick={handleSubmit}
            >
              Create Reminder
            </Button>
          </GridItem>
        </Grid>
      </Box>
      <DashboardDrawer />
      {/* Success Modal */}
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Submission Successful</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Text>
              {" "}
              You Will Receive Reminders on Your Phone When It's Time to Take
              the Pills.
            </Text>
            <Text fontSize="sm" mt={8}>
              If you have any question, email us at:{" "}
              <a href="mailto:pillgen27@gmail.com" style={{ color: "purple" }}>
                pillgen27@gmail.com
              </a>
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              colorScheme="green"
              ml={3}
              ref={cancelRef}
              onClick={onClose}
            >
              Okay
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Home;
