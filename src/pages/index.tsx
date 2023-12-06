import { useMagicSigner } from "@/hooks/useMagicSigner";
import { RPCError, RPCErrorCode } from "magic-sdk";
import { chain, alchemyApiKey } from "@/config/client";
import {
  useCallback,
  useState,
} from "react";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  Address,
  getDefaultEntryPointAddress, 
} from "@alchemy/aa-core";
import { getRpcUrl } from "@/config/rpc";

const Home = () => {
  const [email, setEmail] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [ownerAddress, setOwnerAddress] = useState<Address>();
  const [scaAddress, setScaAddress] = useState<Address>();
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      rpcUrl: getRpcUrl(),
    })
  );
  
  const { magic, signer } = useMagicSigner();

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEmail(e.target.value);
  }
  
  const login = useCallback(
    async () => {
      if (!magic || !magic.user || !signer) {
        throw new Error("Magic not initialized");
      }
      let didToken: any;
      try{
        didToken = await magic.auth.loginWithEmailOTP({
        email,
        showUI: true,
      })} catch(e) {
        if(e instanceof RPCError) {
          switch (e.code) {
            case RPCErrorCode.InternalError:
              return;
          }
        }
      }

      const metadata = await magic.user.getMetadata();

      if (!didToken || !metadata.publicAddress || !metadata.email) {
        throw new Error("Magic login failed");
      }
      
      setOwnerAddress(metadata.publicAddress as Address);
      setLoggedIn(await magic.user.isLoggedIn());

      const provider: AlchemyProvider = new AlchemyProvider({
        apiKey: alchemyApiKey,
        chain,
      }).connect(
        (rpcClient) =>
          new LightSmartContractAccount({
            rpcClient,
            owner: signer,
            chain,
            entryPointAddress: getDefaultEntryPointAddress(chain),
            factoryAddress: getDefaultLightAccountFactoryAddress(chain),
          })
      );
      setProvider(provider);
      setScaAddress(await provider.getAddress());
    },
    [magic, signer]
  );

  const logout: any = useCallback(async () => {
    if (!magic || !magic.user) {
      throw new Error("Magic not initialized");
    }

    if (!(await magic.user.logout())) {
      throw new Error("Magic logout failed");
    }
    setLoggedIn(false);
    const disconnectedProvider = provider.disconnect();
    setProvider(disconnectedProvider);
  }, [magic]);

  return (
  <div className="ml-4">
    {loggedIn ?  
    <div>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
      <div>You are logged in</div>
      <div>Your magic wallet adderss is {ownerAddress}</div>
      <div>Your smart account adderss is {scaAddress}</div>
    </div> : 
    <div>
      <h3 className="font-bold text-lg">Enter your email!</h3>
      <div><input placeholder="email" onChange={onEmailChange}/></div>
      <div>
        <button onClick={login}>Login</button>
      </div>
      <div>You are logged out</div>
    </div>}
  </div>)
}

export default Home;

// import { MagicSigner } from "@alchemy/aa-signers";

// // this is generated from the [Magic Dashboard](https://dashboard.magic.link/)
// const MAGIC_API_KEY = "pk_test_...";

// export const createMagicSigner = async () => {
//   const magicSigner = new MagicSigner({ apiKey: MAGIC_API_KEY });

//   await magicSigner.authenticate({
//     authenticate: async () => {
//       await magicSigner.inner.wallet.connectWithUI();
//     },
//   });

//   return magicSigner;
// };