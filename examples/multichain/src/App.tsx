"use client";

import { useState } from "react";
import { useMultichain } from "./multichain/hooks.ts";
import {
  Container,
  Flex,
  Box,
  Image,
  createListCollection,
  Text,
  Link,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { toaster } from "./components/ui/toaster"
import { ExternalLink } from "lucide-react";
import { BackgroundNoise } from "./components/layout/background.tsx";
import { NativeSelectField, NativeSelectRoot } from "./components/ui/native-select.tsx";

const EXTENSION_ID = "eklmonnmoaepkgaomjcefmimkkfikokn";

const networks = createListCollection({
  items: [
    { label: "Ethereum", value: "eip155:1" },
    { label: "Linea", value: "eip155:59144" },
  ],
});

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(["eip155:1"]);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const client = useMultichain();

  const handleConnect = async () => {
    try {
      const connected = await client.connect({ extensionId: EXTENSION_ID });
      if (connected) {
        const session = await client.createSession({
          requiredScopes: {
            "eip155:1": {
              methods: [],
              notifications: ["accountsChanged", "chainChanged"],
            },
            "eip155:59144": {
              methods: [],
              notifications: ["accountsChanged", "chainChanged"],
            },
          },
        });
        console.log("session", session);
        setIsConnected(true);
        if (session.sessionScopes["eip155:1"]?.accounts?.[0]) {
          const address = session.sessionScopes["eip155:1"].accounts[0].split(':')[2];
          setUserAddress(address);
        }
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnected(false);
    }
  };

  const handleDisconnect = () => {
    client.disconnect();
    setIsConnected(false);
  };

  const signMessage = async () => {
    try {
      const result = await client.invokeMethod({
        scope: "eip155:1",
        request: {
          method: "personal_sign",
          params: [
            "0x506c65617365207369676e2074686973206d65737361676520746f20636f6e6669726d20796f7572206964656e746974792e",
            userAddress,
          ],
        },
      });
      console.log("result", result);
      toaster.create({
        title: "Message Signed",
        description: "Your message was successfully signed",
        type: "success",
        duration: 4000,
      });
    } catch (error) {
      toaster.create({
        title: "Signing Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        type: "error",
        duration: 4000,
      });
    }
  };

  const fetchBlockNumber = async () => {
    try {
      const result = await client.invokeMethod({
        scope: currentNetwork[0],
        request: {
          method: "eth_blockNumber",
          params: [],
        },
      });
      const blockNum = Number.parseInt(result as string, 16).toLocaleString(); // Convert hex to decimal and format
      toaster.create({
        title: "Block Number Retrieved",
        description: `Latest block number: ${blockNum}`,
        type: "success",
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to fetch block number:", error);
      toaster.create({
        title: "Failed to Fetch Block Number",
        description: error instanceof Error ? error.message : "An error occurred",
        type: "error",
        duration: 4000,
      });
    }
  };

  const handleNetworkChange = (details: { value: string[] }) => {
    setCurrentNetwork(details.value);
  };

  return (
    <>
      <BackgroundNoise />

      <Container w="5xl" h="100vh">
        <Flex align="center" justify="space-between" py={10}>
          <Image src="/metamask-logo.svg" alt="Logo" height="40px" />
          <Flex gap={4} align="center">
            {isConnected && (
              <NativeSelectRoot size="lg" width="150px">
                <NativeSelectField
                  value={currentNetwork[0]}
                  onChange={(e) => handleNetworkChange({ value: [e.target.value] })}
                  bg="white"
                  color="black"
                  borderRadius="sm"
                  border="none"
                  fontWeight="medium"
                >
                  {networks.items.map((network) => (
                    <option key={network.value} value={network.value}>
                      {network.label}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            )}
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              type="button"
              colorScheme="blue"
              size="lg"
            >
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </Flex>
        </Flex>

        <Box mt={4} mx="auto" maxW="5xl">
          {isConnected ? (
            <Flex direction="column" gap={8}>
              <Box borderWidth="1px" borderRadius="lg" p={6} bg="rgba(20, 20, 21, 0.44)">
                <Text fontSize="xl" mb={2} color="white" fontWeight="medium">
                  Wallet Actions
                </Text>
                <Text fontSize="md" color="gray.400" mb={4}>
                  Try out these wallet interactions using the MetaMask Multichain SDK
                </Text>
                <Flex gap={4} wrap="wrap">
                  <Button onClick={signMessage} colorScheme="gray" size="lg">
                    Sign Message
                  </Button>
                  <Button onClick={fetchBlockNumber} colorScheme="gray" size="lg">
                    Fetch Latest Block
                  </Button>
                </Flex>
              </Box>

              <Box
                borderWidth="1px"
                borderRadius="lg"
                p={6}
                bg="rgba(20, 20, 21, 0.44)"
              >
                <Text fontSize="xl" mb={4} color="white" fontWeight="medium">
                  Learn More
                </Text>
                <Flex direction="column" gap={3}>
                  <Link
                    href="https://docs.metamask.io/sdk/"
                    target="_blank"
                    color="blue.400"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    Documentation <ExternalLink size={16} />
                  </Link>
                  <Link
                    href="https://github.com/MetaMask/metamask-sdk"
                    target="_blank"
                    color="blue.400"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    GitHub Repository <ExternalLink size={16} />
                  </Link>
                  <Link
                    href="https://docs.metamask.io/sdk/reference/"
                    target="_blank"
                    color="blue.400"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    API Reference <ExternalLink size={16} />
                  </Link>
                </Flex>
              </Box>
            </Flex>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="300px"
              p={8}
            >
              <Box fontSize="4xl" mb={4}>
                🔒
              </Box>
              <Text fontSize="xl" color="gray.200" fontWeight="medium">
                Not connected
              </Text>
              <Text color="gray.400" mt={2}>
                Connect your wallet to get started
              </Text>
            </Flex>
          )}
        </Box>
      </Container>
    </>
  );
}

export default App;
