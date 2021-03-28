import React, { useRef, useContext } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  DrawerCloseButton,
  IconButton,
  DrawerFooter,
  DrawerBody,
  Box,
  Stack,
} from "@chakra-ui/react";
import { BsBoundingBox } from "react-icons/bs";
import { AuthContext } from "../../auth/main-auth-functionality";
import { WarningTwoIcon, EmailIcon } from "@chakra-ui/icons";

const DashboardDrawer: React.FC = () => {
  const { handleLogOut } = useContext(AuthContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const logOut = () => {
    handleLogOut();
  };

  const btnRef = useRef();

  return (
    <>
      <IconButton
        variant="outline"
        aria-label="open dashboard"
        size="sm"
        icon={<BsBoundingBox />}
        ref={btnRef}
        onClick={onOpen}
        pos="fixed"
        right={["5px", "8px", "12px", "20px"]}
        top="5px"
        color="grey"
        zIndex={99}
      />

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody></DrawerBody>

          <DrawerFooter>
            <Box w="100%" d="flex" flexDir="column">
              <Stack spacing={5}>
                <a href="mailto:pillgen27@gmail.com">
                  <Button
                    onClick={logOut}
                    justifyContent="space-around"
                    w="100%"
                    margin="0 auto"
                    color="gray"
                    leftIcon={<EmailIcon />}
                    mt={8}
                  >
                    Contact
                  </Button>
                </a>
                <Button
                  onClick={logOut}
                  justifyContent="space-around"
                  w="100%"
                  margin="0 auto"
                  color="gray"
                  leftIcon={<WarningTwoIcon />}
                  mt={5}
                >
                  Log Out
                </Button>
              </Stack>
            </Box>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DashboardDrawer;
