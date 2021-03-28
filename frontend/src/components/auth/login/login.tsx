import React, { useContext, useState } from "react";
import { AuthContext } from "../../../auth/main-auth-functionality";
import styles from "./login.module.css";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Stack,
  Box,
  Grid,
  GridItem,
  useColorMode,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

const UserLogin: React.FC = () => {
  const { handleLogin, emailError, passwordError, loginLoading } = useContext(
    AuthContext
  );

  const { colorMode } = useColorMode();

  const [passVisibility, setPassVisibility] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const togglePassVisibility = (): void => {
    setPassVisibility(!passVisibility);
  };

  return (
    <>
      <Grid templateColumns="repeat(12, 1fr)" className={styles.container}>
        <GridItem
          display={["none", "none", "none", "initial", "initial"]}
          colSpan={[5, 5, 5, 5]}
          className={styles.illusContainer}
        >
          <div>
            <div className={styles.illusContent}>
              <Text fontSize="2xl">Pillzen</Text>
            </div>

            <img
              src="/crayon-logged-out-1.png"
              alt="login image"
              className={styles.ilusImg}
            />
            <Box pos="absolute" left={4} bottom={5} fontSize="xs">
              Illustration by{" "}
              <a href="https://dribbble.com/Ivan_Haidutski">Ivan Haidutski</a>{" "}
              from <a href="https://icons8.com/">Icons8</a>
            </Box>
          </div>
        </GridItem>
        <GridItem
          colSpan={[12, 12, 12, 7, 7]}
          className={styles.authActionContainer}
        >
          <Box display={["initial", "initial", "initial", "none", "none"]}>
            <Box
              display="table"
              m="0 auto"
              borderRadius="2px"
              padding="0 5px"
              bg={"black"}
            >
              <Text fontSize="2xl" color="black">
                Pillzen
              </Text>
            </Box>
          </Box>

          <Box
            className={styles.boxContainer}
            width={[
              "100%", // base
              "90%", // 480px upwards
              "80%", // 768px upwards
              "75%", // 992px upwards
            ]}
          >
            <Text
              fontSize="xl"
              borderBottom="6px double"
              display="table"
              m="auto"
              mb="20px"
              borderColor={colorMode === "dark" ? "#e8e8e8" : "#1c212e"}
            >
              Login
            </Text>
            <form onSubmit={handleSubmit}>
              <Stack spacing={8}>
                <FormControl isInvalid={!!emailError} isRequired>
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <Input
                    autoFocus
                    type="email"
                    id="email"
                    placeholder="email"
                    aria-describedby="email-helper-text"
                    onChange={handleEmailChange}
                    value={email}
                  />
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!passwordError} isRequired>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup size="md" id="password">
                    <Input
                      onChange={handlePassChange}
                      pr="4.5rem"
                      type={passVisibility ? "text" : "password"}
                      placeholder="password"
                      value={password}
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={togglePassVisibility}
                        bg={
                          colorMode === "dark"
                            ? "#323233"
                            : "rgb(237, 242, 247)"
                        }
                        _hover={{
                          background:
                            colorMode === "dark"
                              ? "#1c1c1c"
                              : "rgb(240, 243, 247)",
                        }}
                        pr={5}
                        pl={5}
                      >
                        {passVisibility ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                </FormControl>
                <Box
                  className={styles.submitBtnContainer}
                  width={[
                    "75%", // base
                    "60%", // 480px upwards
                    "50%", // 768px upwards
                    "45%", // 992px upwards
                    "45%",
                  ]}
                >
                  <Button
                    isLoading={loginLoading.validatingLogin}
                    loadingText="logging in"
                    colorScheme="grey"
                    variant="outline"
                    type="submit"
                    height="43px"
                    border="2px"
                    className={styles.submitBtn}
                  >
                    Login
                  </Button>
                </Box>
              </Stack>
            </form>
            <Stack mt={10} spacing={4}>
              <Text as="u">
                <a href="/create-account">
                  Don't have an account? Create account
                </a>
              </Text>

              <Text as="u">
                <a href="/auth/reset-password">Forgot Password?</a>
              </Text>
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};

export default UserLogin;
