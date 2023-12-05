import { useMagicSigner } from "@/hooks/useMagicSigner";
import {
  useCallback,
  useState,
} from "react";

const Home = () => {
  const [email, setEmail] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [publicWalletAddress, setPublicWalletAddress] = useState<string>("0x");

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

      const didToken = await magic.auth.loginWithEmailOTP({
        email,
        showUI: true,
      });
      const metadata = await magic.user.getMetadata();
      if (!didToken || !metadata.publicAddress || !metadata.email) {
        throw new Error("Magic login failed");
      }
      console.log(metadata)
      setPublicWalletAddress(metadata.publicAddress);

      setLoggedIn(await magic.user.isLoggedIn());
    },
    [magic, signer]
  );

  const logout = useCallback(async () => {
    if (!magic || !magic.user) {
      throw new Error("Magic not initialized");
    }

    if (!(await magic.user.logout())) {
      throw new Error("Magic logout failed");
    }
    setLoggedIn(false);
  }, [magic]);

  console.log(loggedIn)

  return (
  <div className="ml-4">
    <h3 className="font-bold text-lg">Enter your email!</h3>
  
    <div><input placeholder="email" onChange={onEmailChange}/></div>
    {loggedIn ?  
    <div>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
      <div>You are logged in</div>
      <div>Your magic wallet adderss is {publicWalletAddress}</div>
    </div> : 
    <div>
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