import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { AsYouType } from "libphonenumber-js";
import { getCountryTelCode } from "./countries";
import { v4 as uuid } from "uuid";
import { PhoneIcon } from "@chakra-ui/icons";

export default function PhoneNumberInput({
  size,
  value,
  country,
  options,
  onChange,
  placeholder,
  ...rest
}) {
  const [number, setNumber] = useState(value || "");
  const [selectedCountry, setSelectedCountry] = useState(country || "");
  const [countryCode, setCountryCode] = useState(
    getCountryTelCode(country) || ""
  );

  useEffect(() => {
    setSelectedCountry(country);
    setCountryCode(getCountryTelCode(country));
  }, [country]);

  const onCountryChange = (e) => {
    const value = e.target.value;
    const code = getCountryTelCode(value);
    const parsedNumber = new AsYouType().input(`${code}${number}`);

    setCountryCode(code);
    setSelectedCountry(code);
    onChange(parsedNumber);
  };

  const onPhoneNumberChange = (e) => {
    const value = e.target.value;
    const parsedNumber = new AsYouType().input(`${countryCode}${value}`);

    setNumber(value);
    onChange(parsedNumber);
  };

  return (
    <InputGroup size={size} {...rest}>
      <InputLeftElement
        mr={2}
        bg="rgb(237, 242, 247)"
        borderRadius={2}
        width="4rem"
      >
        <Box>
          <Select
            width="6rem"
            pos="absolute"
            left={-16}
            top={0}
            opacity={0}
            zIndex={100}
            value={selectedCountry}
            onChange={onCountryChange}
          >
            <option value="" />

            {options.map((option) => (
              <option key={uuid()} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {selectedCountry ? <Box>{selectedCountry}</Box> : <PhoneIcon />}
        </Box>
      </InputLeftElement>
      <Input
        pl="5rem"
        type="tel"
        value={number}
        // pattern="[0-9]"
        placeholder={placeholder}
        onChange={onPhoneNumberChange}
      />
    </InputGroup>
  );
}

PhoneNumberInput.defaultProps = {
  options: [],
  size: "md",
};
